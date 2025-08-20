import User from "../models/userSchema.js";
import Dive from "../models/diveSchema.js";

export const createDive = async (req, res) => {
    const { date } = req.body;
    
    // Check if user is authenticated
    if (!req.user || !req.user._id) {
        return res.status(401).json({ 
            message: "Authentication required. Please log in to book a dive." 
        });
    }

    // Check if date is provided
    if (!date) {
        return res.status(400).json({ 
            message: "Date is required" 
        });
    }

    try {
        // Validate and format date to only include day, month, and year
        let formattedDate;
        
        if (typeof date === 'string') {
            // If date is a string, parse it and create a new Date object
            const parsedDate = new Date(date);
            
            // Check if the date is valid
            if (isNaN(parsedDate.getTime())) {
                return res.status(400).json({ 
                    message: "Invalid date format. Please provide a valid date (YYYY-MM-DD)" 
                });
            }
            
            // Create a new date with only day, month, and year (set time to 00:00:00)
            formattedDate = new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate());
        } else if (date instanceof Date) {
            // If date is already a Date object, format it the same way
            formattedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        } else {
            return res.status(400).json({ 
                message: "Invalid date format. Please provide a valid date" 
            });
        }

        // Create new dive with the authenticated user's ID
        const newDive = new Dive({ 
            date: formattedDate, 
            user: req.user._id, 
            diverName: req.user.fullName, // Extract user ID from authenticated request
            status: "Pending"     // Default status
        });
        
        await newDive.save();
        
        // Return success response with dive details
        return res.status(201).json({ 
            message: "Dive created successfully", 
            dive: {
                _id: newDive._id,
                date: formattedDate.toISOString().split('T')[0], // Return date as YYYY-MM-DD string
                status: newDive.status,
                user: {
                    id: req.user._id,
                    fullName: req.user.fullName,
                    email: req.user.email
                },
                createdAt: newDive.createdAt,
                updatedAt: newDive.updatedAt
            }
        });
    } catch (error) {
        console.error("Error creating dive:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getUserDives = async (req, res) => {
    try {
        // Check if user is authenticated
        if (!req.user || !req.user._id) {
            return res.status(401).json({ 
                message: "Authentication required. Please log in to view your dives." 
            });
        }

        // Find all dives for the authenticated user
        const userDives = await Dive.find({ user: req.user._id })
            .sort({ date: 1, createdAt: -1 }); // Sort by date ascending, then by creation time descending

        // Format the response
        const formattedDives = userDives.map(dive => ({
            _id: dive._id,
            date: dive.date.toISOString().split('T')[0], // Format date as YYYY-MM-DD
            status: dive.status,
            createdAt: dive.createdAt,
            updatedAt: dive.updatedAt
        }));

        return res.status(200).json({
            message: "User dives retrieved successfully",
            dives: formattedDives,
            count: formattedDives.length
        });
    } catch (error) {
        console.error("Error getting user dives:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getAllDives = async (req, res) => {
    try {
        // Only admins should reach here (enforced by middleware), but double-check
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({ 
                message: 'Admin access required' 
            });
        }

        const dives = await Dive.find({})
            .sort({ date: 1, createdAt: -1 })
            .populate('user', 'fullName email');

        const formattedDives = dives.map(dive => ({
            _id: dive._id,
            date: dive.date.toISOString().split('T')[0],
            status: dive.status,
            user: dive.user ? {
                id: dive.user._id,
                fullName: dive.user.fullName,
                email: dive.user.email
            } : undefined,
            createdAt: dive.createdAt,
            updatedAt: dive.updatedAt
        }));

        return res.status(200).json({
            message: 'All dives retrieved successfully',
            dives: formattedDives,
            count: formattedDives.length
        });
    } catch (error) {
        console.error('Error getting all dives:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateDive = async (req, res) => {
    try {
        // Enforce admin
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const { id } = req.params;
        const { status, date } = req.body;

        // Validate status if provided
        const allowedStatuses = ["Approved", "Pending", "Rejected"];
        if (typeof status !== 'undefined' && !allowedStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        // Prepare updates
        const updates = {};
        if (typeof status !== 'undefined') {
            updates.status = status;
        }

        if (typeof date !== 'undefined') {
            if (!date) {
                return res.status(400).json({ message: 'Date is required when provided' });
            }
            let formattedDate;
            if (typeof date === 'string') {
                const parsedDate = new Date(date);
                if (isNaN(parsedDate.getTime())) {
                    return res.status(400).json({ message: 'Invalid date format. Please provide a valid date (YYYY-MM-DD)' });
                }
                formattedDate = new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate());
            } else if (date instanceof Date) {
                formattedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            } else {
                return res.status(400).json({ message: 'Invalid date format. Please provide a valid date' });
            }
            updates.date = formattedDate;
        }

        // No fields provided
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: 'No valid fields provided to update' });
        }

        const updated = await Dive.findByIdAndUpdate(
            id,
            { $set: updates },
            { new: true }
        ).populate('user', 'fullName email');

        if (!updated) {
            return res.status(404).json({ message: 'Dive not found' });
        }

        return res.status(200).json({
            message: 'Dive updated successfully',
            dive: {
                _id: updated._id,
                date: updated.date.toISOString().split('T')[0],
                status: updated.status,
                user: updated.user ? {
                    id: updated.user._id,
                    fullName: updated.user.fullName,
                    email: updated.user.email,
                } : undefined,
                createdAt: updated.createdAt,
                updatedAt: updated.updatedAt,
            }
        });
    } catch (error) {
        console.error('Error updating dive:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};