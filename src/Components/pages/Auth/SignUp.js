import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useFormik } from "formik";
import * as yup from "yup";
import { toast } from "sonner";

import AuthLayout from "../../layout/AuthLayout";
import { Button } from "../../ui/Button";
import { FormikField } from "../../ui/Field";
import { MailIcon, UserCircleIcon } from "../../ui/Icons";
import axiosInstance, { errorMessage } from "../../../config/AxiosInstance";

const PASSWORD_RULE =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;

function SignUp() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async ({ username, email, password }) => {
    try {
      setLoading(true);
      const res = await axiosInstance.post("/auth/signup", {
        username,
        email,
        password,
      });
      if (res.data?.success) {
        toast.success("Account created, please sign in");
        navigate("/login", { replace: true });
        return;
      }
      toast.error(res.data?.message || "Could not create the account");
    } catch (error) {
      toast.error(errorMessage(error, "Could not create the account"));
    } finally {
      setLoading(false);
    }
  };

  const formik = useFormik({
    initialValues: { username: "", email: "", password: "", cpassword: "" },
    validationSchema: yup.object({
      username: yup
        .string()
        .trim()
        .min(3, "At least 3 characters")
        .required("Username is required"),
      email: yup
        .string()
        .email("Enter a valid email")
        .required("Email is required"),
      password: yup
        .string()
        .min(8, "At least 8 characters")
        .matches(
          PASSWORD_RULE,
          "Use an uppercase, a lowercase, a number and a special character"
        )
        .required("Password is required"),
      cpassword: yup
        .string()
        .oneOf([yup.ref("password")], "Passwords do not match")
        .required("Confirm your password"),
    }),
    onSubmit: handleSubmit,
  });

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start issuing GST invoices in a couple of minutes."
    >
      <form onSubmit={formik.handleSubmit} className="space-y-4" noValidate>
        <FormikField
          formik={formik}
          name="username"
          label="Username"
          placeholder="yourname"
          autoComplete="username"
          icon={UserCircleIcon}
        />
        <FormikField
          formik={formik}
          name="email"
          type="email"
          label="Email"
          placeholder="you@company.com"
          autoComplete="email"
          icon={MailIcon}
        />
        <FormikField
          formik={formik}
          name="password"
          type="password"
          label="Password"
          placeholder="••••••••"
          autoComplete="new-password"
          hint="8+ characters, mixed case, a number and a symbol."
        />
        <FormikField
          formik={formik}
          name="cpassword"
          type="password"
          label="Confirm password"
          placeholder="••••••••"
          autoComplete="new-password"
        />

        <Button
          type="submit"
          size="lg"
          className="w-full"
          loading={loading}
          loadingText="Creating account..."
        >
          Create account
        </Button>

        <p className="pt-1 text-center text-sm text-muted">
          Already registered?{" "}
          <Link
            to="/login"
            className="font-medium text-fg underline decoration-strong underline-offset-4 transition-colors hover:decoration-fg"
          >
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export default SignUp;
