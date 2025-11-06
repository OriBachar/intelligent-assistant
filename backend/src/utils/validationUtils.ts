import { Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../types/error';

export const handleValidationError = (error: unknown, res: Response) => {
    if (error instanceof ZodError) {
        const formattedErrors = error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
        }));
        

        throw new AppError(
            'Validation failed',
            400,
            true,
            { errors: formattedErrors }
        );
    }

    if (error instanceof AppError) {
        throw error;
    }

    throw new AppError('Validation processing failed', 500);
};