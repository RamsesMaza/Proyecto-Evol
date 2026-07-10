import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { PageSkeleton } from "../components/ui/Skeleton";
import { RouteGuard, PublicGuard } from "../components/RouteGuard";

const Home = lazy(() => import("../pages/Home"));
const Nosotros = lazy(() => import("../pages/Nosotros"));
const Solicitudes = lazy(() => import("../pages/Solicitudes"));
const Servicios = lazy(() => import("../pages/Servicios"));
const Contacto = lazy(() => import("../pages/Contacto"));
const Blog = lazy(() => import("../pages/Blog"));
const BlogPost = lazy(() => import("../pages/BlogPost"));
const VerifyCertificate = lazy(() => import("../pages/VerifyCertificate"));
const Auth = lazy(() => import("../pages/Auth"));
const ProductDetail = lazy(() => import("../pages/ProductDetail"));
const Checkout = lazy(() => import("../pages/Checkout"));
const OrderConfirmation = lazy(() => import("../pages/OrderConfirmation"));
const PendingPayment = lazy(() => import("../pages/PendingPayment"));
const UserPanel = lazy(() => import("../pages/UserPanel"));

const AppRouter = () => (
  <Routes>
    <Route
      path="/"
      element={
        <Suspense fallback={<PageSkeleton variant="home" />}>
          <Home />
        </Suspense>
      }
    />
    <Route
      path="/nosotros"
      element={
        <Suspense fallback={<PageSkeleton variant="nosotros" />}>
          <Nosotros />
        </Suspense>
      }
    />
    <Route
      path="/solicitudes/*"
      element={
        <Suspense fallback={<PageSkeleton variant="solicitudes" />}>
          <Solicitudes />
        </Suspense>
      }
    />
    <Route
      path="/servicios"
      element={
        <Suspense fallback={<PageSkeleton variant="servicios" />}>
          <Servicios />
        </Suspense>
      }
    />
    <Route
      path="/blog"
      element={
        <Suspense fallback={<PageSkeleton variant="blog" />}>
          <Blog />
        </Suspense>
      }
    />
    <Route
      path="/blog/:slug"
      element={
        <Suspense fallback={<PageSkeleton variant="blogPost" />}>
          <BlogPost />
        </Suspense>
      }
    />
    <Route
      path="/contacto"
      element={
        <Suspense fallback={<PageSkeleton variant="contacto" />}>
          <Contacto />
        </Suspense>
      }
    />
    <Route
      path="/verifica-tu-certificado"
      element={
        <Suspense fallback={<PageSkeleton variant="verify" />}>
          <VerifyCertificate />
        </Suspense>
      }
    />
    <Route
      path="/login"
      element={
        <PublicGuard>
          <Suspense fallback={<PageSkeleton variant="login" />}>
            <Auth />
          </Suspense>
        </PublicGuard>
      }
    />
    <Route
      path="/producto/:id"
      element={
        <Suspense fallback={<PageSkeleton variant="producto" />}>
          <ProductDetail />
        </Suspense>
      }
    />
    <Route
      path="/checkout"
      element={
        <Suspense fallback={<PageSkeleton variant="checkout" />}>
          <Checkout />
        </Suspense>
      }
    />
    <Route
      path="/checkout/success"
      element={
        <Suspense fallback={<PageSkeleton variant="default" />}>
          <OrderConfirmation />
        </Suspense>
      }
    />
    <Route
      path="/checkout/pending-payment"
      element={
        <Suspense fallback={<PageSkeleton variant="default" />}>
          <PendingPayment />
        </Suspense>
      }
    />
    <Route
      path="/panel/*"
      element={
        <RouteGuard>
          <Suspense fallback={<PageSkeleton variant="panel" />}>
            <UserPanel />
          </Suspense>
        </RouteGuard>
      }
    />
    <Route
      path="*"
      element={
        <div
          style={{
            padding: "100px",
            textAlign: "center",
            fontFamily: "'Poppins', sans-serif",
          }}
        >
          404 - No encontrado
        </div>
      }
    />
  </Routes>
);

export default AppRouter;
