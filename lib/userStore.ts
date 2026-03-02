import fs from "fs";
import path from "path";
import { hashPassword, verifyPassword } from "./password";

interface StoredUser {
    email: string;
    fullName: string;
    passwordHash: string;
    createdAt: string;
}

const USERS_FILE = path.join(process.cwd(), "data", "users.json");

function ensureDataDir() {
    const dir = path.dirname(USERS_FILE);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function readUsers(): StoredUser[] {
    ensureDataDir();
    if (!fs.existsSync(USERS_FILE)) {
        return [];
    }
    try {
        const data = fs.readFileSync(USERS_FILE, "utf-8");
        return JSON.parse(data);
    } catch {
        return [];
    }
}

function writeUsers(users: StoredUser[]) {
    ensureDataDir();
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
}

export function findUserByEmail(email: string): StoredUser | null {
    const users = readUsers();
    return users.find((u) => u.email === email.toLowerCase()) || null;
}

export function createUser(email: string, fullName: string, password: string): { success: true; user: { email: string; fullName: string } } | { success: false; error: string } {
    const normalizedEmail = email.toLowerCase();
    const existing = findUserByEmail(normalizedEmail);
    if (existing) {
        return { success: false, error: "An account with this email already exists." };
    }

    const passwordHash = hashPassword(password);
    const newUser: StoredUser = {
        email: normalizedEmail,
        fullName,
        passwordHash,
        createdAt: new Date().toISOString(),
    };

    const users = readUsers();
    users.push(newUser);
    writeUsers(users);

    return { success: true, user: { email: normalizedEmail, fullName } };
}

export function authenticateUser(email: string, password: string): { success: true; user: { email: string; fullName: string } } | { success: false; error: string } {
    const user = findUserByEmail(email.toLowerCase());
    if (!user) {
        return { success: false, error: "No account found with this email. Please sign up first." };
    }

    const isValid = verifyPassword(password, user.passwordHash);
    if (!isValid) {
        return { success: false, error: "Incorrect password. Please try again." };
    }

    return { success: true, user: { email: user.email, fullName: user.fullName } };
}
