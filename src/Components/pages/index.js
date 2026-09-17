import React, { Suspense, lazy } from "react";
import { Route, Routes, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { BlockLoader, PageLoader } from "../ui/Loader";
import AppShell from "../layout/AppShell";
import Home from "./Dashboard/Home";
import CustomerDetails from "./Customars/CustomerDetails";
import ProductsDetails from "./Products/ProducstDetails";
import BillForm from "./Bill/BillForm";
import BillInformation from "./Bill/BillInformation";
import MyProfile from "./Profile/MyProfile";
import ProfileForm from "./Profile/ProfileForm";
import Login from "./Auth/Login";
import SignUp from "./Auth/SignUp";

// the PDF libraries are big, so load the invoice page only when needed
const BillTable = lazy(() => import("./Bill/BillTable"));

function PublicOnly() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />;
}

function RequireAuth() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <AppShell /> : <Navigate to="/login" replace />;
}

function Router() {
  const { isLoading } = useAuth();

  if (isLoading) return <PageLoader label="Loading your books..." />;

  return (
    <Suspense fallback={<BlockLoader />}>
      <Routes>
        <Route element={<PublicOnly />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
        </Route>

        <Route element={<RequireAuth />}>
          <Route index element={<Home />} />
          <Route path="/customersdetails" element={<CustomerDetails />} />
          <Route path="/productsdetails" element={<ProductsDetails />} />
          <Route path="/billform/:id" element={<BillForm />} />
          <Route path="/billinformation" element={<BillInformation />} />
          <Route path="/billtable/:id" element={<BillTable />} />
          <Route path="/myprofile" element={<MyProfile />} />
          <Route path="/profileform" element={<ProfileForm />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default Router;
