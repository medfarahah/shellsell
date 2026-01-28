'use client'

import { Star, XIcon } from 'lucide-react';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useUser } from '@clerk/nextjs';
import { useDispatch } from 'react-redux';
import { addRating } from '@/lib/features/rating/ratingSlice';

const RatingModal = ({ ratingModal, setRatingModal }) => {
    const { user } = useUser();
    const dispatch = useDispatch();

    const [rating, setRating] = useState(0);
    const [review, setReview] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!user) {
            toast.error('Please sign in to submit a review');
            return;
        }

        if (rating <= 0 || rating > 5) {
            toast.error('Please select a rating between 1 and 5');
            return;
        }
        if (review.trim().length < 5) {
            toast.error('Please write a short review');
            return;
        }

        if (!ratingModal?.productId || !ratingModal?.orderId) {
            toast.error('Missing product or order information');
            return;
        }

        try {
            setSubmitting(true);

            const res = await fetch('/api/ratings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    rating,
                    review: review.trim(),
                    userId: user.id,
                    productId: ratingModal.productId,
                    orderId: ratingModal.orderId,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to submit rating');
            }

            // Update local Redux state so UI reflects the new rating immediately
            dispatch(addRating(data));

            toast.success('Rating submitted successfully');
            setRatingModal(null);
        } catch (error) {
            console.error('Submit rating error:', error);
            toast.error(error.message || 'Failed to submit rating');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className='fixed inset-0 z-120 flex items-center justify-center bg-black/10'>
            <div className='bg-white p-8 rounded-lg shadow-lg w-96 relative'>
                <button
                    onClick={() => !submitting && setRatingModal(null)}
                    className='absolute top-3 right-3 text-gray-500 hover:text-gray-700 disabled:opacity-50'
                    disabled={submitting}
                >
                    <XIcon size={20} />
                </button>
                <h2 className='text-xl font-medium text-slate-600 mb-4'>Rate Product</h2>
                <div className='flex items-center justify-center mb-4'>
                    {Array.from({ length: 5 }, (_, i) => (
                        <Star
                            key={i}
                            className={`size-8 cursor-pointer ${rating > i ? "text-green-400 fill-current" : "text-gray-300"}`}
                            onClick={() => !submitting && setRating(i + 1)}
                        />
                    ))}
                </div>
                <textarea
                    className='w-full p-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-green-400'
                    placeholder='Write your review'
                    rows='4'
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    disabled={submitting}
                ></textarea>
                <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className='w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition disabled:opacity-60 disabled:cursor-not-allowed'
                >
                    {submitting ? 'Submitting...' : 'Submit Rating'}
                </button>
            </div>
        </div>
    );
};

export default RatingModal;