const fs = require('fs');
const model = JSON.parse(fs.readFileSync('artifacts/model_adaboost.json','utf-8'));
const EPS=1e-15;
function softmax(values){const m=Math.max(...values);const exps=values.map(v=>Math.exp(v-m));const d=exps.reduce((a,b)=>a+b,0);return exps.map(v=>v/d)}
function traverseTree(tree,x){let node=0;while(tree.children_left[node]!==-1&&tree.children_right[node]!==-1){const f=tree.feature[node];const t=tree.threshold[node];node=x[f]<=t?tree.children_left[node]:tree.children_right[node]}const counts=tree.value[node][0];const total=counts.reduce((a,b)=>a+b,0);const k=model.n_classes;return counts.map(c=>Math.max((c+1)/(total+k),EPS))}
function predict(vec){const k=model.n_classes;const scaled=vec.map((v,i)=>(v-model.preprocess.mean[i])/model.preprocess.std[i]);const F=new Array(k).fill(0);model.trees.forEach((tree,idx)=>{const p=traverseTree(tree,scaled);const logs=p.map(v=>Math.log(v));const logMean=logs.reduce((a,b)=>a+b,0)/k;const f=logs.map(v=>(k-1)*(v-logMean));for(let i=0;i<k;i++)F[i]+=model.estimator_weights[idx]*f[i]});return softmax(F.map(v=>v/(k-1)));}
const vectors = JSON.parse(process.argv[2]);
const out = vectors.map(predict);
process.stdout.write(JSON.stringify(out));
