const mongoose = require('mongoose');
const slugify = require('slugify');

const PartSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a name'],
            unique: true,
            trim: true,
            maxlength: [50, 'Name can not be more than 50 characters']
        },
        slug: String,
        description: {
            type: String,
            required: [true, 'Please add a description'],
            maxlength: [500, 'Description can not be more than 500 characters']
        },
        phone: {
            type: String,
            maxlength: [20, 'Phone number can not be longer than 20 characters']
        },
        email: {
            type: String,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                'Please add a valid email'
            ]
        },
        averageIox: Number,
        maxIox: Number,
        minIox: Number,
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: true
        }
    },
    {
        toJSON: {virtuals: true},
        toObject: {virtuals: true}
    });

// Create part slug from the name
PartSchema.pre('save', function(next) {
    this.slug = slugify(this.name, {lower: true});
    next()
})

// Cascade delete sectionProps when a part is deleted
PartSchema.pre('remove', async function(next) {
    console.log(`SectionProps being removed from part ${this._id}`);
    await this.model('SectionProp').deleteMany({ part: this._id });
    next();
});

// Reverse populate with virtuals
PartSchema.virtual('sectionProps', {
    ref: 'SectionProp',
    localField: '_id',
    foreignField: 'part',
    justOne: false
});

module.exports = mongoose.model('Part', PartSchema);