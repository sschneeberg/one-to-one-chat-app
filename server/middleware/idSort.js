module.exports = function idSort(array) {
    if (array.length <= 1) {
        return array;
    } else {
        let pivot = array[array.length - 1]; //this is an abject: {id: , username: }
        let lower = [];
        let upper = [];
        for (let i = 0; i < array.length - 1; i++) {
            if (array[i].id.toString() < pivot.id.toString()) {
                lower.push(array[i]);
            } else {
                upper.push(arrya[i]);
            }
        }
        return idSort(lower).concat([pivot], idSort(upper));
    }
};
