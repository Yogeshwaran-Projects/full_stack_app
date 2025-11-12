import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import * as bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { phone_number, password } = body;

        if (!phone_number || !password) {
            return NextResponse.json(
                { error: "Phone number and password are required" },
                { status: 400 }
            );
        }

        const user = await prisma.users.findUnique({
            where: { phone_number }
        });

        if (!user) {
            return NextResponse.json(
                { error: "Invalid phone number or password" },
                { status: 401 } 
            );
        }

        const isPasswordValid = await bcrypt.compare(password, user.hashed_password);

        if (!isPasswordValid) {
            return NextResponse.json(
                { error: "Invalid phone number or password" },
                { status: 401 } 
            );
        }

        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            console.error("JWT_SECRET is not set in .env file");
            return NextResponse.json(
                { error: "Internal Server Error" },
                { status: 500 }
            );
        }

        const tokenPayload = {
            userId: user.id,
            role: user.role,
            phone: user.phone_number
        };

        const token = jwt.sign(tokenPayload, jwtSecret, {
            expiresIn: '1d' 
        });

        return NextResponse.json(
            { 
                user: {
                    id: user.id,
                    phone_number: user.phone_number,
                    role: user.role 
                },
                token: token 
            },
            { status: 200 }
        );

    } catch (error: any) {
        console.error("Login Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}