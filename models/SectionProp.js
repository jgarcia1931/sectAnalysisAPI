const mongoose = require('mongoose');

const SectionPropSchema = new mongoose.Schema({
    sectionName: {
        type: String,
        trim: true,
        required: [true, 'Please add a sectionProp title']
    },
    Iox: Number,
    Ioy: Number,
    xbar: Number,
    ybar: Number,
    geom: [[Number]],
    createdAt: {
        type: Date,
        default: Date.now
    },
    part: {
        type: mongoose.Schema.ObjectId,
        ref: 'Part',
        required: true
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    }
});

// Static method to get avg of sectionProp tuitions
SectionPropSchema.statics.getAverageCost = async function(partId) {
    const obj = await this.aggregate([
        {
            $match: { part: partId }
        },
        {
            $group: {
                _id: '$part',
                averageIox: {$avg: '$Iox' },
                maxIox: {$max: '$Iox'},
                minIox: {$min: '$Iox'}
            }
        }
    ]);

    try {
        if (obj[0]) {
            await this.model("Part").findByIdAndUpdate(partId, {
                averageIox:obj[0].averageIox,
                maxIox:obj[0].maxIox,
                minIox:obj[0].minIox
            });
        } else {
            await this.model("Part").findByIdAndUpdate(partId, {
                averageIox: undefined,
                maxIox: undefined,
                minIox: undefined
            });
        }
    } catch (err) {
        console.error(err);
    }
};

// Call getAverageCost after save
SectionPropSchema.post('save', async function() {
    await this.constructor.getAverageCost(this.part);
});

// Call getAverageCost after remove
SectionPropSchema.post('remove', async function () {
    await this.constructor.getAverageCost(this.part);
});


module.exports = mongoose.model('SectionProp', SectionPropSchema);