//code below largely based on below tutorial:
//https://medium.com/geekculture/implementing-k-means-clustering-from-scratch-in-javascript-13d71fbcb31e#:~:text=K%2Dmeans%20clustering%20is%20an,(clusters)%20of%20similar%20items.&text=The%20%E2%80%9Ck%E2%80%9D%20in%20k%2D,to%20divide%20the%20dataset%20in.

const MAX_ITERATIONS = 50;
const NUM_CLUSTERS = 55;

function randomBetween(min, max) {
    return Math.floor(
        Math.random() * (max - min) + min
    );
}

function calcMeanCentroid(dataSet, start, end) {
    const features = dataSet[0].length;
    const n = end - start;
    let mean = [];
    for (let i = 0; i < features; i++) {
        mean.push(0);
    }
    for (let i = start; i < end; i++) {
        for (let j = 0; j < features; j++) {
            mean[j] = mean[j] + dataSet[i][j] / n;
        }
    }
    return mean;
}

function getRandomCentroidsNaiveSharding(dataset, k) {
    // implementation of a variation of naive sharding centroid initialization method
    // (not using sums or sorting, just dividing into k shards and calc mean)
    // https://www.kdnuggets.com/2017/03/naive-sharding-centroid-initialization-method.html
    const numSamples = dataset.length;
    // Divide dataset into k shards:
    const step = Math.floor(numSamples / k);
    const centroids = [];
    for (let i = 0; i < k; i++) {
        const start = step * i;
        let end = step * (i + 1);
        if (i + 1 === k) {
            end = numSamples;
        }
        centroids.push(calcMeanCentroid(dataset, start, end));
    }
    return centroids;
}

function getRandomCentroids(dataset, k) {
    // selects random points as centroids from the dataset
    const numSamples = dataset.length;
    const centroidsIndex = [];
    let index;
    while (centroidsIndex.length < k) {
        index = randomBetween(0, numSamples);
        if (centroidsIndex.indexOf(index) === -1) {
            centroidsIndex.push(index);
        }
    }
    const centroids = [];
    for (let i = 0; i < centroidsIndex.length; i++) {
        const centroid = [...dataset[centroidsIndex[i]]];
        centroids.push(centroid);
    }
    return centroids;
}

function compareCentroids(a, b) {
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) {
            return false;
        }
    }
    return true;
}

function shouldStop(oldCentroids, centroids, iterations) {
    if (iterations > MAX_ITERATIONS) {
        return true;
    }
    if (!oldCentroids || !oldCentroids.length) {
        return false;
    }
    let sameCount = true;
    for (let i = 0; i < centroids.length; i++) {
        if (!compareCentroids(centroids[i], oldCentroids[i])) {
            sameCount = false;
        }
    }
    return sameCount;
}

// Calculate Squared Euclidean Distance
function getDistanceSQ(a, b) {
    const diffs = [];
    for (let i = 0; i < a.length; i++) {
        diffs.push(a[i] - b[i]);
    }
    return diffs.reduce((r, e) => (r + (e * e)), 0);
}

// Returns a label for each piece of data in the dataset.
function getLabels(dataSet, centroids) {
    // prep data structure:
    const labels = {};
    for (let c = 0; c < centroids.length; c++) {
        labels[c] = {
            points: [],
            centroid: centroids[c],
        };
    }
    // For each element in the dataset, choose the closest centroid.
    // Make that centroid the element's label.
    for (let i = 0; i < dataSet.length; i++) {
        const a = dataSet[i];
        let closestCentroid, closestCentroidIndex, prevDistance;
        for (let j = 0; j < centroids.length; j++) {
            let centroid = centroids[j];
            if (j === 0) {
                closestCentroid = centroid;
                closestCentroidIndex = j;
                prevDistance = getDistanceSQ(a, closestCentroid);
            } else {
                // get distance:
                const distance = getDistanceSQ(a, centroid);
                if (distance < prevDistance) {
                    prevDistance = distance;
                    closestCentroid = centroid;
                    closestCentroidIndex = j;
                }
            }
        }
        // add point to centroid labels:
        labels[closestCentroidIndex].points.push(a);
    }
    return labels;
}

function getPointsMean(pointList) {
    const totalPoints = pointList.length;
    const means = [];
    for (let j = 0; j < pointList[0].length; j++) {
        means.push(0);
    }
    for (let i = 0; i < pointList.length; i++) {
        const point = pointList[i];
        for (let j = 0; j < point.length; j++) {
            const val = point[j];
            means[j] = means[j] + val / totalPoints;
        }
    }
    return means;
}

function recalculateCentroids(dataSet, labels, k) {
    // Each centroid is the geometric mean of the points that
    // have that centroid's label. Important: If a centroid is empty (no points have
    // that centroid's label) you should randomly re-initialize it.
    let newCentroid;
    const newCentroidList = [];
    for (const k in labels) {
        const centroidGroup = labels[k];
        if (centroidGroup.points.length > 0) {
            // find mean:
            newCentroid = getPointsMean(centroidGroup.points);
        } else {
            // get new random centroid
            newCentroid = getRandomCentroids(dataSet, 1)[0];
        }
        newCentroidList.push(newCentroid);
    }
    return newCentroidList;
}

function createFeatureLists(dataset, desiredFeatures){
    // let desiredFeatures = ["auc_of_roc", "0.1", "0.3", "0.5"] // Both precision and recall will be used for each threshold value
    let featureList = [];
    let regionList = [];

    for (const gis_join in dataset){
        let regional_features = [];
        for(let i = 0; i < desiredFeatures.length; i++){
            if(i === 0){
                regional_features.push(gis_join);
            }
            if(desiredFeatures[i] === "auc_of_roc") {
                regional_features.push(dataset[gis_join]["auc_of_roc"]);
            }
            else{
                regional_features.push(dataset[gis_join][desiredFeatures[i][0]][desiredFeatures[i][1]]);
            }
        }

        let regional_features_copy = [...regional_features];
        regional_features_copy.shift();

        regionList.push(regional_features);
        featureList.push(regional_features_copy);
    }
    return {featureList, regionList};
}

function reformatClusters(clusters, regionList, colorValues){
    let reformattedCluster = {};

    for (const index in clusters){
        let points = clusters[index]["points"];
        for (const point in points) {
            for (const region_point in regionList) {
                if (JSON.stringify(points[point]) === JSON.stringify(regionList[region_point].slice(1))){
                    reformattedCluster[regionList[region_point][0]] = colorValues[index];
                }
            }
        }
    }
    return reformattedCluster;
}

function kmeans(dataset, k, colorValues, desiredFeatures, useNaiveSharding = true) {
    let dataset_regionList = createFeatureLists(dataset, desiredFeatures);

    dataset = dataset_regionList.featureList;
    let regionList = dataset_regionList.regionList;

    if (dataset.length && dataset[0].length && dataset.length > k) {
        // Initialize book keeping variables
        let iterations = 0;
        let oldCentroids, labels, centroids;

        // Initialize centroids randomly
        if (useNaiveSharding) {
            centroids = getRandomCentroidsNaiveSharding(dataset, k);
        } else {
            centroids = getRandomCentroids(dataset, k);
        }

        // Run the main k-means algorithm
        while (!shouldStop(oldCentroids, centroids, iterations)) {
            // Save old centroids for convergence test.
            oldCentroids = [...centroids];
            iterations++;

            // Assign labels to each datapoint based on centroids
            labels = getLabels(dataset, centroids);
            centroids = recalculateCentroids(dataset, labels, k);
        }

        let clusters = [];
        for (let i = 0; i < k; i++) {
            clusters.push(labels[i]);
        }

        const colored_regions = reformatClusters(clusters, regionList, colorValues);

        const results = {
            colored_regions: colored_regions,
            converged: iterations <= MAX_ITERATIONS,
        };
        return results;
    } else {
        throw new Error('Invalid dataset');
    }
}

export default kmeans;