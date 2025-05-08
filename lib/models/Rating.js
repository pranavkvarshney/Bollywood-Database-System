import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    movie_id: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 10
    },
    review: {
        type: String,
        maxlength: 500
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});


ratingSchema.index({ user: 1, movie_id: 1 }, { unique: true });


ratingSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

const Rating = mongoose.models.Rating || mongoose.model('Rating', ratingSchema);
export default Rating; 