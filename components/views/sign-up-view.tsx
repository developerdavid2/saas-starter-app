import React, { useState } from "react";
import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.email(),
    password: z.string().min(1, "Password is required"),
    confirmPassword: z.string().min(1, "Confirm Password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password is required",
    path: ["confirmPassword"],
  });

type FormSchema = z.infer<typeof formSchema>;

export const SignInView = () => {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [pending, setPending] = useState(false);
  const [pendingVerifyCode, setPendingVerifyCode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // HANDLER FUNCTION TO SUBMIT SIGNUP DETAILS
  const signIn = async (data: any) => {
    setPending(true);
    setError(null);

    try {
      await signUp.create({});

      await signUp.prepareEmailVerification;
    } catch (error) {
      setError(error);
    }
  };

  if (!isLoaded) return null;

  return <div>SignInView</div>;
};
