import { artifacts } from "@/lib/artifacts";

const EPS = 1e-15;

function softmax(values: number[]): number[] {
  const maxVal = Math.max(...values);
  const exps = values.map((v) => Math.exp(v - maxVal));
  const denom = exps.reduce((a, b) => a + b, 0);
  return exps.map((v) => v / denom);
}

function traverseTree(tree: (typeof artifacts.model.trees)[number], x: number[]): number[] {
  let node = 0;
  while (tree.children_left[node] !== -1 && tree.children_right[node] !== -1) {
    const feature = tree.feature[node];
    const threshold = tree.threshold[node];
    node = x[feature] <= threshold ? tree.children_left[node] : tree.children_right[node];
  }
  const counts = tree.value[node][0] as number[];
  const total = counts.reduce((a, b) => a + b, 0);
  const k = artifacts.model.n_classes;
  return counts.map((count) => Math.max((count + 1) / (total + k), EPS));
}

export function predictAdaBoost(featureVector: number[]) {
  const model = artifacts.model;
  const k = model.n_classes;
  const scaled = featureVector.map((v, i) => (v - model.preprocess.mean[i]) / model.preprocess.std[i]);
  const F = new Array(k).fill(0);

  model.trees.forEach((tree, idx) => {
    const p = traverseTree(tree, scaled);
    const logs = p.map((v) => Math.log(v));
    const logMean = logs.reduce((a, b) => a + b, 0) / k;
    const f = logs.map((v) => (k - 1) * (v - logMean));
    for (let i = 0; i < k; i += 1) {
      F[i] += model.estimator_weights[idx] * f[i];
    }
  });

  const probs = softmax(F.map((v) => v / (k - 1)));
  const maxIndex = probs.indexOf(Math.max(...probs));
  return {
    label: model.labels[maxIndex],
    probs: {
      H: probs[0],
      D: probs[1],
      A: probs[2]
    }
  };
}

export { softmax };
