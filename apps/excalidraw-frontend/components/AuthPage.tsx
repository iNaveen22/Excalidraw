"use client";
import { useState } from "react";
import { api } from "../app/src/lib/axios";
import { useRouter } from "next/navigation";

export function AuthPage({ isSignin }: { isSignin: boolean }) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    async function handleAuth() {
        try {
            setLoading(true);

            const endpoint = isSignin ? "/signin" : "/signup";


            const payload = isSignin
                ? { email: email.trim(), password }
                : { name: name.trim(), email: email.trim(), password };

            const res = await api.post(endpoint, payload);

            if (isSignin) {
                const token = res.data.token;
                if (!token) {
                    throw new Error("No token received");
                }

                localStorage.setItem("token", token);
                alert("Signed in successfully");

                router.push("/room");
            } else {
                alert("Signed up successfully. Please sign in.");
                router.push("/signin");
            }
        } catch (err: any) {
            alert(err.response?.data?.message || "Auth failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="h-screen w-screen flex justify-center items-center">
            <div className="p-4 bg-white rounded flex flex-col gap-2 w-64">

                {!isSignin && (
                    <input
                        type="text"
                        placeholder="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="border p-2 rounded text-shadow-black"
                    />
                )}
                <input
                    type="text"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border p-2 rounded text-shadow-black"
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border p-2 rounded text-shadow-black"
                />

                <button
                    onClick={handleAuth}
                    disabled={loading}
                    className="bg-black text-white p-2 rounded"
                >
                    {loading
                        ? "Loading..."
                        : isSignin
                            ? "Sign in"
                            : "Sign up"}
                </button>
            </div>
        </div>
    );
}
