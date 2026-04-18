# DeReFund - Decentralized Donation & Relief Tracking System

A blockchain-based platform for transparent disaster relief donations built on Polygon testnet. DeReFund enables donors to contribute to verified relief campaigns, NGOs to create and manage fundraising campaigns, and volunteers to verify campaign authenticity before they go live.

## Overview

DeReFund solves the problem of transparency and trust in disaster relief funding by:
- Providing transparent donation tracking on the blockchain
- Implementing a volunteer verification system for campaigns
- Requiring admin approval for all campaigns before accepting donations
- Recording all transactions with verifiable transaction hashes

## Key Features

### User Roles
- **DONOR**: Can donate to campaigns, verify campaigns as volunteer, report disasters
- **NGO**: Can create and manage fundraising campaigns, submit disasters
- **ADMIN**: Can approve disasters, approve campaigns, verify NGOs, manage users

### Core Systems
- **Disaster Management**: Report, track, and approve disaster cases
- **Campaign System**: Create verified fundraising campaigns linked to disasters
- **Donation System**: Transparent blockchain-verified donations
- **Volunteer Verification**: Community-driven campaign authenticity verification
- **Milestone Tracking**: Track campaign progress with milestones

## Tech Stack

### Frontend
- React 19.2.0 + Vite 7.2.4
- Tailwind CSS 4.1.18
- React Router DOM 7.13.0
- GSAP 3.14.2 + Framer Motion 12.33.0
- ethers 6.16.0 + wagmi 3.4.1 + viem 2.45.0

### Backend
- Node.js + Express 5.2.1
- PostgreSQL with Drizzle ORM 0.44.0
- JWT Authentication (jsonwebtoken 9.0.3)
- Cloudinary for file storage
- Multer for file uploads

### Smart Contracts
- Solidity + Hardhat 2.22.0
- OpenZeppelin Contracts 5.4.0
- Polygon Mumbai Testnet

## Quick Links

- [Setup Guide](./SETUP_GUIDE.md)
- [Project Structure](./PROJECT_STRUCTURE.md)
- [API Documentation](./API_DOCUMENTATION.md)
- [Database Schema](./DATABASE_SCHEMA.md)
- [User Guide](./USER_GUIDE.md)
