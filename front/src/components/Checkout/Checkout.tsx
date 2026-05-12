import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  FaCheck,
  FaTruck,
  FaStore,
  FaYoutube,
  FaCcVisa,
  FaCcMastercard,
  FaPaypal,
  FaCreditCard,
  FaLock,
  FaUser,
  FaSignInAlt,
} from "react-icons/fa";
import { SiMercadopago } from "react-icons/si";
import { useCart } from "../../context/CartContext";
import { useToast } from "../../context/ToastContext";
import { validateEmail } from "../../utils/validators";

const formatPrice = (n: number) =>
  `S/ ${n.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

type Step = "info" | "shipping" | "payment" | "review" | "receipt";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  border: "1px solid #e5e7eb",
  borderRadius: 10,
  fontSize: 14,
  fontFamily: "'Poppins', sans-serif",
  outline: "none",
  boxSizing: "border-box",
};
const labelStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  color: "#444",
  display: "block",
  marginBottom: 4,
};
const errorStyle: React.CSSProperties = {
  fontSize: 11,
  color: "#ef4444",
  marginTop: 4,
};
const btnPrimary = (disabled: boolean): React.CSSProperties => ({
  flex: 1,
  padding: 14,
  background: disabled ? "#ccc" : "#111",
  color: "#fff",
  border: "none",
  borderRadius: 10,
  fontSize: 14,
  fontWeight: 600,
  cursor: disabled ? "not-allowed" : "pointer",
  fontFamily: "'Poppins', sans-serif",
});
const btnSecondary: React.CSSProperties = {
  flex: 1,
  padding: 14,
  background: "#fff",
  color: "#111",
  border: "1px solid #e5e7eb",
  borderRadius: 10,
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "'Poppins', sans-serif",
};

const getCardType = (num: string) => {
  const cleaned = num.replace(/\D/g, "");
  if (cleaned.startsWith("4"))
    return {
      name: "Visa",
      icon: <FaCcVisa style={{ fontSize: 28, color: "#1a1f71" }} />,
    };
  if (["51", "52", "53", "54", "55"].some((p) => cleaned.startsWith(p)))
    return {
      name: "Mastercard",
      icon: <FaCcMastercard style={{ fontSize: 28, color: "#eb001b" }} />,
    };
  return null;
};
const formatCardNumber = (v: string) =>
  v
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, "$1 ");
const formatExpiry = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
};

const Checkout: React.FC = () => {
  const { cart, subtotal, clearCart } = useCart();
  const { showToast } = useToast();
  const [step, setStep] = useState<Step>("info");
  const [loading, setLoading] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zip: "",
    notes: "",
  });
  const [shippingMethod, setShippingMethod] = useState("delivery");
  const [paymentMethod, setPaymentMethod] = useState("yape");
  const [card, setCard] = useState({
    holder: "",
    number: "",
    expiry: "",
    cvv: "",
  });
  const [yapeCode, setYapeCode] = useState("");
  const [simulatingPayment, setSimulatingPayment] = useState(false);
  const [splitFirstMethod, setSplitFirstMethod] = useState<
    "tarjeta" | "efectivo"
  >("tarjeta");
  const [splitFirstAmt, setSplitFirstAmt] = useState("");
  const [splitSecondDate, setSplitSecondDate] = useState("");
  const [splitSecondDetails, setSplitSecondDetails] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [billing, setBilling] = useState({
    type: "boleta",
    ruc: "",
    name: "",
    address: "",
  });
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [finalOrderId, setFinalOrderId] = useState<number | null>(null);
  const [receiptEmail, setReceiptEmail] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [orderSummary, setOrderSummary] = useState<{
    subtotal: number;
    tax: number;
    shipping: number;
    discount: number;
    total: number;
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    billingType: string;
    billingRuc: string;
    billingName: string;
    paymentMethod: string;
    yapeCode?: string;
    splitFirstMethod?: "tarjeta" | "efectivo";
    splitFirstNum?: number;
    splitSecondNum?: number;
    splitSecondDate?: string;
    splitSecondDetails?: string;
    splitCode?: string;
  } | null>(null);

  const tax = subtotal * 0.18;
  const shipping =
    shippingMethod === "delivery" ? (subtotal >= 5000 ? 0 : 50) : 0;
  const discount = cart.discount;
  const total = Math.max(0, subtotal + tax + shipping - discount);

  const t = (f: string) => {
    setTouched((p) => ({ ...p, [f]: true }));
  };

  const updateForm = (f: string, v: string) => {
    setForm((p) => ({ ...p, [f]: v }));
    t(f);
  };
  const updateBilling = (f: string, v: string) => {
    setBilling((p) => ({ ...p, [f]: v }));
    t(`bill_${f}`);
  };
  const updateCard = (f: string, v: string) => {
    let val = v;
    if (f === "number") val = formatCardNumber(v);
    if (f === "expiry") val = formatExpiry(v);
    if (f === "cvv") val = v.replace(/\D/g, "").slice(0, 4);
    setCard((p) => ({ ...p, [f]: val }));
    t(`card_${f}`);
  };
  const updateLogin = (f: string, v: string) =>
    setLoginForm((p) => ({ ...p, [f]: v }));

  const isInfoValid =
    form.name.trim().length >= 3 &&
    validateEmail(form.email) &&
    form.phone.trim().length >= 7;
  const isShippingValid =
    shippingMethod === "pickup" ||
    (form.address.trim().length >= 5 && form.city.trim().length >= 3);
  const isCardMethod =
    paymentMethod === "visa" || paymentMethod === "mastercard";
  const isMixedMethod = paymentMethod === "mixto";
  const isCardValid =
    card.holder.trim().length >= 3 &&
    card.number.replace(/\s/g, "").length >= 13 &&
    card.expiry.replace(/\D/g, "").length === 4 &&
    card.cvv.replace(/\D/g, "").length >= 3;
  const splitFirstNum = Number(splitFirstAmt) || 0;
  const splitSecondNum = total - splitFirstNum;
  const splitCode = useMemo(
    () => Math.floor(10000000 + Math.random() * 90000000).toString(),
    [splitFirstMethod],
  );
  const isSplitValid =
    splitFirstNum > 0 &&
    splitFirstNum < total &&
    splitSecondDate.trim().length > 0 &&
    splitSecondDetails.trim().length > 0;
  const isYapeMethod = paymentMethod === "yape" || paymentMethod === "plin";
  const isMpPayment = paymentMethod === "mercadopago";
  const isPaypalMethod = paymentMethod === "paypal";
  const isPaymentValid = isCardMethod
    ? isCardValid
    : isMixedMethod
      ? isSplitValid
      : isYapeMethod
        ? yapeCode.trim().length >= 6
        : true;

  const body = () => ({
    items: cart.items.map((i) => ({
      productId: i.productId,
      quantity: i.quantity,
      price: i.price,
      title: i.title,
    })),
    customerName: form.name,
    customerEmail: form.email,
    customerPhone: form.phone,
    customerAddress: form.address,
    customerCity: form.city,
    customerZip: form.zip,
    shippingMethod,
    paymentMethod,
    paymentDetail: isMixedMethod
      ? {
          firstPayment: {
            method: splitFirstMethod,
            amount: splitFirstNum,
            code: splitFirstMethod === "efectivo" ? splitCode : undefined,
          },
          secondPayment: {
            method: splitFirstMethod === "tarjeta" ? "efectivo" : "tarjeta",
            amount: Math.max(0, splitSecondNum),
            date: splitSecondDate,
            details: splitSecondDetails,
          },
        }
      : isYapeMethod
        ? { yapeCode }
        : undefined,
    subtotal,
    tax,
    shipping,
    discount,
    couponCode: cart.couponCode,
    total,
    notes: form.notes,
    billingType: billing.type,
    billingRuc: billing.ruc,
    billingName: billing.name,
    billingAddress: billing.address,
  });

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      if (isMpPayment || isPaypalMethod) {
        setSimulatingPayment(true);
        await new Promise((r) => setTimeout(r, 2000));
      }

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body()),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al procesar el pedido");
      setOrderSummary({
        subtotal,
        tax,
        shipping,
        discount,
        total,
        name: form.name,
        email: form.email,
        phone: form.phone,
        address: form.address,
        city: form.city,
        billingType: billing.type,
        billingRuc: billing.ruc,
        billingName: billing.name,
        paymentMethod,
        yapeCode: isYapeMethod ? yapeCode : undefined,
        splitFirstMethod: isMixedMethod ? splitFirstMethod : undefined,
        splitFirstNum: isMixedMethod ? splitFirstNum : undefined,
        splitSecondNum: isMixedMethod ? splitSecondNum : undefined,
        splitSecondDate: isMixedMethod ? splitSecondDate : undefined,
        splitSecondDetails: isMixedMethod ? splitSecondDetails : undefined,
        splitCode:
          isMixedMethod && splitFirstMethod === "efectivo"
            ? splitCode
            : undefined,
      });
      clearCart();
      setFinalOrderId(data.orderId);
      setReceiptEmail(form.email);
      setStep("receipt");
    } catch (e: any) {
      showToast(e.message || "Error al procesar el pedido", "error");
    } finally {
      setLoading(false);
      setSimulatingPayment(false);
    }
  };

  const handleLogin = async () => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginForm.email,
          password: loginForm.password,
          captchaToken: "test",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const u = data.user;
      setForm((p) => ({
        ...p,
        name: `${u.firstName} ${u.lastName}`,
        email: u.email,
      }));
      setShowLogin(false);
      showToast("Sesión iniciada", "success");
    } catch (e: any) {
      showToast(e.message || "Error al iniciar sesión", "error");
    }
  };

  const steps = [
    { key: "info", label: "Información" },
    { key: "shipping", label: "Envío" },
    { key: "payment", label: "Pago" },
    { key: "review", label: "Revisar" },
  ];
  const stepIndex = steps.findIndex((s) => s.key === step);
  const cardType = isCardMethod ? getCardType(card.number) : null;

  const radioCard = (value: string, label: string, icon: React.ReactNode) => (
    <label
      key={value}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "14px 16px",
        border: `2px solid ${paymentMethod === value ? "#C10E1A" : "#e5e7eb"}`,
        borderRadius: 12,
        marginBottom: 10,
        cursor: "pointer",
        transition: "all 0.2s",
        background: paymentMethod === value ? "rgba(193,14,26,0.03)" : "#fff",
      }}
    >
      <input
        type="radio"
        name="payment"
        value={value}
        checked={paymentMethod === value}
        onChange={(e) => {
          setPaymentMethod(e.target.value);
          setTouched({});
        }}
        style={{ accentColor: "#C10E1A" }}
      />
      <span
        style={{
          fontSize: 22,
          color: paymentMethod === value ? "#C10E1A" : "#888",
        }}
      >
        {icon}
      </span>
      <span style={{ fontWeight: 600, fontSize: 14 }}>{label}</span>
    </label>
  );

  const inputField = (
    key: string,
    lbl: string,
    val: string,
    onChange: (k: string, v: string) => void,
    opts?: {
      type?: string;
      placeholder?: string;
      maxLength?: number;
      touchKey?: string;
      showErr?: boolean;
    },
  ) => {
    const tk = opts?.touchKey || key;
    const isErr = touched[tk] && !val && opts?.showErr !== false;
    return (
      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>{lbl}</label>
        <input
          type={opts?.type || "text"}
          value={val}
          placeholder={opts?.placeholder}
          onChange={(e) => onChange(key, e.target.value)}
          maxLength={opts?.maxLength}
          style={{ ...inputStyle, borderColor: isErr ? "#ef4444" : "#e5e7eb" }}
          onFocus={(e) => (e.target.style.borderColor = "#C10E1A")}
          onBlur={(e) => {
            e.target.style.borderColor = isErr ? "#ef4444" : "#e5e7eb";
          }}
        />
        {isErr && <p style={errorStyle}>Este campo es obligatorio</p>}
      </div>
    );
  };

  if (step === "receipt") {
    const os = orderSummary;
    const handleDownloadPdf = async () => {
      try {
        const res = await fetch(`/api/orders/${finalOrderId}/invoice`);
        if (!res.ok) throw new Error("Error al descargar");
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `recibo-${finalOrderId}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      } catch {
        showToast("Error al descargar el recibo", "error");
      }
    };

    const handleSendEmail = async () => {
      if (!receiptEmail) {
        showToast("Ingresa un correo", "error");
        return;
      }
      setSendingEmail(true);
      try {
        const res = await fetch(`/api/orders/${finalOrderId}/send-invoice`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: receiptEmail }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        showToast("Recibo enviado a tu correo", "success");
      } catch (e: any) {
        showToast(e.message || "Error al enviar", "error");
      } finally {
        setSendingEmail(false);
      }
    };

    return (
      <div
        style={{
          background: "#f8f9fa",
          minHeight: "100vh",
          fontFamily: "'Poppins', sans-serif",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: 24,
            padding: "50px 40px",
            maxWidth: 560,
            width: "100%",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 30 }}>
            <div style={{ fontSize: 56, color: "#10b981", marginBottom: 16 }}>
              <FaCheck />
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>
              ¡Pedido Confirmado!
            </h1>
            <p style={{ color: "#666", fontSize: 14 }}>Orden #{finalOrderId}</p>
          </div>

          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>
              Comprobante de Pago
            </h3>
            <div
              style={{
                background: "#f9fafb",
                borderRadius: 12,
                padding: 16,
                fontSize: 13,
                lineHeight: 2,
              }}
            >
              <div>
                <strong>Cliente:</strong> {os?.name || form.name}
              </div>
              <div>
                <strong>Email:</strong> {os?.email || form.email}
              </div>
              {(os?.billingType || billing.type) === "factura" && (
                <>
                  <div>
                    <strong>RUC:</strong> {os?.billingRuc || billing.ruc}
                  </div>
                  <div>
                    <strong>Razón Social:</strong>{" "}
                    {os?.billingName || billing.name}
                  </div>
                </>
              )}
              <div>
                <strong>Método de pago:</strong>{" "}
                {
                  {
                    yape: "Yape / Plin",
                    plin: "Yape / Plin",
                    visa: "Visa",
                    mastercard: "Mastercard",
                    paypal: "PayPal",
                    mercadopago: "Mercado Pago",
                    mixto: "Mixto (Tarjeta + Efectivo)",
                  }[os?.paymentMethod || paymentMethod]
                }
                {os?.yapeCode ? ` — Código: ${os.yapeCode}` : ""}
              </div>
              {os?.splitFirstMethod && (
                <>
                  <div>
                    <strong>1° pago:</strong>{" "}
                    {os.splitFirstMethod === "tarjeta" ? "Tarjeta" : "Efectivo"}{" "}
                    — {formatPrice(os.splitFirstNum!)}
                    {os.splitFirstMethod === "efectivo" && os.splitCode && (
                      <span> (Código: {os.splitCode})</span>
                    )}
                  </div>
                  <div>
                    <strong>2° pago:</strong>{" "}
                    {os.splitFirstMethod === "tarjeta" ? "Efectivo" : "Tarjeta"}{" "}
                    — {formatPrice(Math.max(0, os.splitSecondNum!))}
                    {os.splitSecondDate
                      ? ` — Fecha: ${os.splitSecondDate}`
                      : ""}
                    {os.splitSecondDetails ? ` — ${os.splitSecondDetails}` : ""}
                  </div>
                </>
              )}
              <div
                style={{
                  borderTop: "1px solid #e5e7eb",
                  marginTop: 8,
                  paddingTop: 8,
                  fontSize: 16,
                  fontWeight: 800,
                }}
              >
                Total: {formatPrice(os?.total ?? total)}
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Enviar recibo a mi correo</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="email"
                value={receiptEmail}
                onChange={(e) => setReceiptEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                style={{ ...inputStyle, flex: 1 }}
                onFocus={(e) => (e.target.style.borderColor = "#C10E1A")}
                onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
              />
              <button
                onClick={handleSendEmail}
                disabled={sendingEmail}
                style={{
                  padding: "12px 20px",
                  background: sendingEmail ? "#ccc" : "#C10E1A",
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: sendingEmail ? "not-allowed" : "pointer",
                  fontFamily: "'Poppins', sans-serif",
                  whiteSpace: "nowrap",
                }}
              >
                {sendingEmail ? "Enviando..." : "Enviar"}
              </button>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button
              onClick={handleDownloadPdf}
              style={{
                padding: 14,
                background: "#111",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              ⬇ Descargar Boleta / Recibo (PDF)
            </button>
            <Link
              to="/servicios"
              style={{
                textAlign: "center",
                padding: 14,
                background: "#f3f4f6",
                color: "#111",
                borderRadius: 10,
                textDecoration: "none",
                fontWeight: 600,
                fontSize: 14,
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              Seguir Comprando
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "#f8f9fa",
        minHeight: "100vh",
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "30px 20px" }}>
        <div
          style={{
            display: "flex",
            gap: 8,
            fontSize: 13,
            color: "#888",
            marginBottom: 30,
          }}
        >
          <Link to="/" style={{ color: "#888", textDecoration: "none" }}>
            Inicio
          </Link>
          <span>/</span>
          <Link
            to="/servicios"
            style={{ color: "#888", textDecoration: "none" }}
          >
            Servicios
          </Link>
          <span>/</span>
          <span style={{ color: "#111" }}>Checkout</span>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 0,
            marginBottom: 40,
          }}
        >
          {steps.map((s, i) => (
            <div key={s.key} style={{ display: "flex", alignItems: "center" }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: stepIndex >= i ? "#C10E1A" : "#e5e7eb",
                  color: stepIndex >= i ? "#fff" : "#888",
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                {stepIndex > i ? <FaCheck style={{ fontSize: 12 }} /> : i + 1}
              </div>
              <span
                style={{
                  marginLeft: 8,
                  fontSize: 13,
                  fontWeight: stepIndex >= i ? 600 : 400,
                  color: stepIndex >= i ? "#111" : "#888",
                }}
              >
                {s.label}
              </span>
              {i < steps.length - 1 && (
                <div
                  style={{
                    width: 60,
                    height: 2,
                    background: stepIndex > i ? "#C10E1A" : "#e5e7eb",
                    margin: "0 12px",
                  }}
                />
              )}
            </div>
          ))}
        </div>

        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 30 }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              padding: 30,
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            {/* ========== INFO STEP ========== */}
            {step === "info" && (
              <>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 24,
                  }}
                >
                  <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>
                    Información del Cliente
                  </h2>
                  <button
                    onClick={() => setShowLogin(!showLogin)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "8px 14px",
                      background: showLogin ? "#f3f4f6" : "#111",
                      color: showLogin ? "#111" : "#fff",
                      border: showLogin ? "1px solid #e5e7eb" : "none",
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "'Poppins', sans-serif",
                    }}
                  >
                    <FaSignInAlt /> {showLogin ? "Cerrar" : "Iniciar Sesión"}
                  </button>
                </div>

                {showLogin && (
                  <div
                    style={{
                      background: "#f9fafb",
                      borderRadius: 12,
                      padding: 16,
                      marginBottom: 20,
                      border: "1px solid #e5e7eb",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        margin: "0 0 12px",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <FaUser /> Inicia sesión con tu cuenta
                    </h3>
                    <div style={{ marginBottom: 12 }}>
                      <label style={labelStyle}>Correo electrónico</label>
                      <input
                        type="email"
                        value={loginForm.email}
                        onChange={(e) => updateLogin("email", e.target.value)}
                        style={inputStyle}
                        placeholder="correo@ejemplo.com"
                        onFocus={(e) =>
                          (e.target.style.borderColor = "#C10E1A")
                        }
                        onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                      />
                    </div>
                    <div style={{ marginBottom: 12 }}>
                      <label style={labelStyle}>Contraseña</label>
                      <input
                        type="password"
                        value={loginForm.password}
                        onChange={(e) =>
                          updateLogin("password", e.target.value)
                        }
                        style={inputStyle}
                        placeholder="********"
                        onFocus={(e) =>
                          (e.target.style.borderColor = "#C10E1A")
                        }
                        onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                      />
                    </div>
                    <button
                      onClick={handleLogin}
                      style={{
                        padding: "10px 24px",
                        background: "#111",
                        color: "#fff",
                        border: "none",
                        borderRadius: 8,
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: "pointer",
                        fontFamily: "'Poppins', sans-serif",
                      }}
                    >
                      Iniciar Sesión
                    </button>
                    <p
                      style={{ fontSize: 11, color: "#888", margin: "8px 0 0" }}
                    >
                      Al iniciar sesión, tus datos se cargarán automáticamente.
                    </p>
                  </div>
                )}

                {inputField("name", "Nombre completo *", form.name, updateForm)}
                {inputField(
                  "email",
                  "Correo electrónico *",
                  form.email,
                  updateForm,
                  { type: "email" },
                )}
                {inputField("phone", "Teléfono *", form.phone, updateForm, {
                  type: "tel",
                })}
                <button
                  onClick={() => setStep("shipping")}
                  disabled={!isInfoValid}
                  style={btnPrimary(!isInfoValid)}
                >
                  Continuar
                </button>
              </>
            )}

            {/* ========== SHIPPING STEP ========== */}
            {step === "shipping" && (
              <>
                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>
                  Dirección de Envío
                </h2>
                {inputField(
                  "address",
                  shippingMethod === "delivery"
                    ? "Dirección *"
                    : "Dirección (opcional)",
                  form.address,
                  updateForm,
                )}
                {inputField(
                  "city",
                  shippingMethod === "delivery"
                    ? "Ciudad *"
                    : "Ciudad (opcional)",
                  form.city,
                  updateForm,
                )}
                {inputField(
                  "zip",
                  "Código Postal (opcional)",
                  form.zip,
                  updateForm,
                  { showErr: false },
                )}

                <h3
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    margin: "24px 0 16px",
                  }}
                >
                  Método de Envío
                </h3>
                {[
                  {
                    value: "delivery",
                    label: "Delivery a domicilio",
                    icon: <FaTruck />,
                    price: subtotal >= 5000 ? "Gratis" : "S/ 50.00",
                  },
                  {
                    value: "pickup",
                    label: "Recojo en tienda",
                    icon: <FaStore />,
                    price: "Gratis",
                  },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "14px 16px",
                      border: `2px solid ${shippingMethod === opt.value ? "#C10E1A" : "#e5e7eb"}`,
                      borderRadius: 12,
                      marginBottom: 10,
                      cursor: "pointer",
                      background:
                        shippingMethod === opt.value
                          ? "rgba(193,14,26,0.03)"
                          : "#fff",
                    }}
                  >
                    <input
                      type="radio"
                      name="shipping"
                      value={opt.value}
                      checked={shippingMethod === opt.value}
                      onChange={(e) => setShippingMethod(e.target.value)}
                      style={{ accentColor: "#C10E1A" }}
                    />
                    <span
                      style={{
                        fontSize: 18,
                        color:
                          shippingMethod === opt.value ? "#C10E1A" : "#888",
                      }}
                    >
                      {opt.icon}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>
                        {opt.label}
                      </div>
                    </div>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>
                      {opt.price}
                    </span>
                  </label>
                ))}

                <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
                  <button onClick={() => setStep("info")} style={btnSecondary}>
                    Atrás
                  </button>
                  <button
                    onClick={() => setStep("payment")}
                    disabled={!isShippingValid}
                    style={btnPrimary(!isShippingValid)}
                  >
                    Continuar
                  </button>
                </div>
              </>
            )}

            {/* ========== PAYMENT STEP ========== */}
            {step === "payment" && (
              <>
                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>
                  Método de Pago
                </h2>
                <div style={{ marginBottom: 20 }}>
                  <h3
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#666",
                      marginBottom: 10,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    Pago en línea
                  </h3>
                  {radioCard("mercadopago", "Mercado Pago", <SiMercadopago />)}
                  {radioCard("paypal", "PayPal", <FaPaypal />)}
                  {radioCard(
                    "visa",
                    "Visa",
                    <FaCcVisa style={{ fontSize: 22 }} />,
                  )}
                  {radioCard(
                    "mastercard",
                    "Mastercard",
                    <FaCcMastercard style={{ fontSize: 22 }} />,
                  )}
                  <h3
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#666",
                      marginBottom: 10,
                      marginTop: 16,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    Otros medios de pago
                  </h3>
                  {radioCard("yape", "Yape / Plin", <FaYoutube />)}
                  {radioCard(
                    "mixto",
                    "Mixto (Tarjeta + Efectivo)",
                    <FaCreditCard />,
                  )}
                </div>

                {isCardMethod && (
                  <div
                    style={{
                      marginTop: 24,
                      padding: 20,
                      background: "#f8fafc",
                      borderRadius: 16,
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        marginBottom: 20,
                      }}
                    >
                      <FaCreditCard
                        style={{ fontSize: 22, color: "#C10E1A" }}
                      />
                      <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>
                        Pago con Tarjeta
                      </h3>
                    </div>

                    {/* ─── PROFESSIONAL CARD PREVIEW ─── */}
                    <div
                      style={{
                        background:
                          "linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #334155 100%)",
                        borderRadius: 16,
                        padding: 24,
                        marginBottom: 20,
                        color: "#fff",
                        minHeight: 250,
                        position: "relative",
                        overflow: "hidden",
                        boxShadow: "0 10px 40px rgba(0,0,0,0.25)",
                      }}
                    >
                      {/* Decorative circles */}
                      <div
                        style={{
                          position: "absolute",
                          top: -40,
                          right: -30,
                          width: 160,
                          height: 160,
                          borderRadius: "50%",
                          background: "rgba(255,255,255,0.04)",
                        }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          bottom: -20,
                          left: -20,
                          width: 100,
                          height: 100,
                          borderRadius: "50%",
                          background: "rgba(255,255,255,0.03)",
                        }}
                      />

                      {/* Top row: chip + brand */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          marginBottom: 24,
                          position: "relative",
                          zIndex: 1,
                        }}
                      >
                        {/* Chip */}
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 2,
                          }}
                        >
                          <div
                            style={{
                              width: 38,
                              height: 28,
                              borderRadius: 4,
                              background:
                                "linear-gradient(135deg, #fbbf24, #d97706)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              position: "relative",
                              overflow: "hidden",
                              boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                            }}
                          >
                            <div
                              style={{
                                width: 28,
                                height: 18,
                                borderRadius: 2,
                                border: "1.5px solid rgba(0,0,0,0.2)",
                              }}
                            />
                            <div
                              style={{
                                position: "absolute",
                                width: 30,
                                height: 1,
                                background: "rgba(0,0,0,0.15)",
                                transform: "rotate(90deg)",
                              }}
                            />
                          </div>
                          <div style={{ display: "flex", gap: 3 }}>
                            <div
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                border: "1px solid rgba(255,255,255,0.3)",
                              }}
                            />
                            <div
                              style={{
                                width: 4,
                                height: 8,
                                borderRadius: 2,
                                background: "rgba(255,255,255,0.3)",
                              }}
                            />
                          </div>
                        </div>
                        {/* Brand */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          {cardType ? (
                            cardType.icon
                          ) : (
                            <FaCreditCard
                              style={{
                                fontSize: 28,
                                color: "rgba(255,255,255,0.4)",
                              }}
                            />
                          )}
                        </div>
                      </div>

                      {/* Card number */}
                      <div
                        style={{
                          fontSize: 22,
                          fontFamily: "'Courier New', monospace",
                          letterSpacing: 4,
                          marginBottom: 70,
                          position: "relative",
                          zIndex: 1,
                        }}
                      >
                        {card.number || "••••  ••••  ••••  ••••"}
                      </div>

                      {/* Bottom row: holder + expiry + cvv */}
                      <div
                        style={{
                          display: "flex",
                          gap: 32,
                          position: "relative",
                          zIndex: 1,
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontSize: 11,
                              textTransform: "uppercase",
                              letterSpacing: 1.5,
                              opacity: 0.5,
                              marginBottom: 2,
                            }}
                          >
                            Titular
                          </div>
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: 600,
                              textTransform: "uppercase",
                              letterSpacing: 1,
                              minHeight: 16,
                            }}
                          >
                            {card.holder || "NOMBRE DEL TITULAR"}
                          </div>
                        </div>
                        <div>
                          <div
                            style={{
                              fontSize: 12,
                              textTransform: "uppercase",
                              letterSpacing: 1.5,
                              opacity: 0.5,
                              marginBottom: 2,
                            }}
                          >
                            Vence
                          </div>
                          <div style={{ fontSize: 11, fontWeight: 600 }}>
                            {card.expiry || "MM/AA"}
                          </div>
                        </div>
                        <div>
                          <div
                            style={{
                              fontSize: 12,
                              textTransform: "uppercase",
                              letterSpacing: 1.5,
                              opacity: 0.5,
                              marginBottom: 2,
                            }}
                          >
                            CVV
                          </div>
                          <div style={{ fontSize: 11, fontWeight: 600 }}>
                            {card.cvv || "•••"}
                          </div>
                        </div>
                      </div>
                    </div>

                    {inputField(
                      "holder",
                      "Nombre del titular *",
                      card.holder,
                      (_, v) => updateCard("holder", v),
                      {
                        touchKey: "card_holder",
                        placeholder: "Como aparece en la tarjeta",
                      },
                    )}
                    {inputField(
                      "number",
                      "Número de tarjeta *",
                      card.number,
                      (_, v) => updateCard("number", v),
                      {
                        touchKey: "card_number",
                        placeholder: "1234 5678 9012 3456",
                        maxLength: 19,
                      },
                    )}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 10,
                      }}
                    >
                      {inputField(
                        "expiry",
                        "Fecha de vencimiento *",
                        card.expiry,
                        (_, v) => updateCard("expiry", v),
                        {
                          touchKey: "card_expiry",
                          placeholder: "MM/AA",
                          maxLength: 5,
                        },
                      )}
                      {inputField(
                        "cvv",
                        "CVV *",
                        card.cvv,
                        (_, v) => updateCard("cvv", v),
                        {
                          touchKey: "card_cvv",
                          placeholder: "123",
                          maxLength: 4,
                        },
                      )}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: 12,
                        background: "#f0fdf4",
                        borderRadius: 10,
                        fontSize: 12,
                        color: "#166534",
                      }}
                    >
                      <FaLock /> Esta es una simulación. No se procesarán pagos
                      reales.
                    </div>
                  </div>
                )}

                {isYapeMethod && (
                  <div
                    style={{
                      marginTop: 24,
                      padding: 20,
                      background: "#f0fdf4",
                      borderRadius: 16,
                      border: "1px solid #86efac",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        marginBottom: 12,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <FaYoutube style={{ color: "#16a34a" }} /> Yape / Plin
                    </h3>
                    <div style={{ marginBottom: 14 }}>
                      <label style={labelStyle}>
                        Código de operación Yape / Plin *
                      </label>
                      <input
                        type="text"
                        value={yapeCode}
                        onChange={(e) => {
                          setYapeCode(e.target.value);
                          t("yape_code");
                        }}
                        placeholder="Ingresa el código de la operación"
                        style={{
                          ...inputStyle,
                          borderColor:
                            touched.yape_code && yapeCode.trim().length < 6
                              ? "#ef4444"
                              : "#e5e7eb",
                        }}
                        onFocus={(e) =>
                          (e.target.style.borderColor = "#C10E1A")
                        }
                        onBlur={(e) => {
                          e.target.style.borderColor =
                            touched.yape_code && yapeCode.trim().length < 6
                              ? "#ef4444"
                              : "#e5e7eb";
                        }}
                      />
                      {touched.yape_code && yapeCode.trim().length < 6 && (
                        <p style={errorStyle}>
                          Ingresa el código de operación (mín. 6 caracteres)
                        </p>
                      )}
                    </div>
                    <div
                      style={{
                        padding: 12,
                        background: "#fff",
                        borderRadius: 10,
                        border: "1px solid #bbf7d0",
                        fontSize: 12,
                        color: "#166534",
                        lineHeight: 1.6,
                      }}
                    >
                      <strong>Yapea al:</strong>{" "}
                      <strong style={{ color: "#C10E1A" }}>999 999 999</strong>
                      <br />
                      <strong>Plin al:</strong>{" "}
                      <strong style={{ color: "#C10E1A" }}>999 999 999</strong>
                      <br />
                      Luego ingresa el código de la operación para confirmar tu
                      pago.
                    </div>
                  </div>
                )}

                {isPaypalMethod && (
                  <div
                    style={{
                      marginTop: 24,
                      padding: 24,
                      background: "#f0f7ff",
                      borderRadius: 16,
                      border: "1px solid #93c5fd",
                      textAlign: "center",
                    }}
                  >
                    <FaPaypal style={{ fontSize: 48, color: "#003087" }} />
                    <h3
                      style={{
                        fontSize: 16,
                        fontWeight: 700,
                        margin: "12px 0 8px",
                      }}
                    >
                      Pago con PayPal
                    </h3>
                    <p
                      style={{ fontSize: 13, color: "#666", marginBottom: 16 }}
                    >
                      Serás redirigido a PayPal para completar el pago de{" "}
                      <strong>{formatPrice(total)}</strong>.
                    </p>
                    <div
                      style={{
                        fontSize: 12,
                        color: "#888",
                        background: "#f9fafb",
                        borderRadius: 8,
                        padding: 10,
                      }}
                    >
                      <FaLock style={{ marginRight: 6 }} /> Simulación — entorno
                      de pruebas
                    </div>
                  </div>
                )}

                {isMpPayment && (
                  <div
                    style={{
                      marginTop: 24,
                      padding: 24,
                      background: "#f0f7ff",
                      borderRadius: 16,
                      border: "1px solid #93c5fd",
                      textAlign: "center",
                    }}
                  >
                    <SiMercadopago style={{ fontSize: 48, color: "#009ee3" }} />
                    <h3
                      style={{
                        fontSize: 16,
                        fontWeight: 700,
                        margin: "12px 0 8px",
                      }}
                    >
                      Pago con Mercado Pago
                    </h3>
                    <p
                      style={{ fontSize: 13, color: "#666", marginBottom: 16 }}
                    >
                      Serás redirigido a Mercado Pago para completar el pago de{" "}
                      <strong>{formatPrice(total)}</strong>.
                    </p>
                    <div
                      style={{
                        fontSize: 12,
                        color: "#888",
                        background: "#f9fafb",
                        borderRadius: 8,
                        padding: 10,
                      }}
                    >
                      <FaLock style={{ marginRight: 6 }} /> Simulación — entorno
                      de pruebas
                    </div>
                  </div>
                )}

                {isMixedMethod && (
                  <div
                    style={{
                      marginTop: 24,
                      padding: 24,
                      background: "#fefce8",
                      borderRadius: 16,
                      border: "1px solid #fde68a",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: 16,
                        fontWeight: 700,
                        marginBottom: 16,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <FaCreditCard style={{ color: "#eab308" }} /> Cronograma
                      de Pago Mixto
                    </h3>

                    <p
                      style={{
                        fontSize: 12,
                        color: "#666",
                        marginBottom: 16,
                        lineHeight: 1.5,
                      }}
                    >
                      Total: <strong>{formatPrice(total)}</strong>. Selecciona
                      el orden de tus pagos.
                    </p>

                    {/* ─── FIRST PAYMENT METHOD SELECTOR ─── */}
                    <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
                      {(["tarjeta", "efectivo"] as const).map((m) => (
                        <label
                          key={m}
                          style={{
                            flex: 1,
                            padding: "14px 12px",
                            border: `2px solid ${splitFirstMethod === m ? "#C10E1A" : "#e5e7eb"}`,
                            borderRadius: 12,
                            cursor: "pointer",
                            textAlign: "center",
                            transition: "all 0.2s",
                            background:
                              splitFirstMethod === m
                                ? "rgba(193,14,26,0.06)"
                                : "#fff",
                          }}
                        >
                          <input
                            type="radio"
                            name="splitFirst"
                            value={m}
                            checked={splitFirstMethod === m}
                            onChange={(e) => {
                              setSplitFirstMethod(
                                e.target.value as "tarjeta" | "efectivo",
                              );
                              setSplitFirstAmt("");
                              setSplitSecondDate("");
                              setSplitSecondDetails("");
                            }}
                            style={{ accentColor: "#C10E1A" }}
                          />
                          <div
                            style={{
                              fontWeight: 700,
                              fontSize: 12,
                              marginTop: 6,
                            }}
                          >
                            1° {m === "tarjeta" ? "Tarjeta" : "Efectivo"}
                          </div>
                        </label>
                      ))}
                    </div>

                    {/* ─── FIRST PAYMENT AMOUNT ─── */}
                    <div style={{ marginBottom: 16 }}>
                      <label style={labelStyle}>
                        Monto del 1° pago (
                        {splitFirstMethod === "tarjeta"
                          ? "Tarjeta"
                          : "Efectivo"}
                        ) *
                      </label>
                      <input
                        type="number"
                        value={splitFirstAmt}
                        onChange={(e) => {
                          setSplitFirstAmt(e.target.value);
                          t("split_first");
                        }}
                        placeholder={`Ej: ${Math.round(total * 0.5)}`}
                        style={{
                          ...inputStyle,
                          borderColor:
                            touched.split_first &&
                            (!splitFirstAmt ||
                              splitFirstNum <= 0 ||
                              splitFirstNum >= total)
                              ? "#ef4444"
                              : "#e5e7eb",
                        }}
                        onFocus={(e) =>
                          (e.target.style.borderColor = "#C10E1A")
                        }
                        onBlur={(e) => {
                          e.target.style.borderColor =
                            touched.split_first &&
                            (!splitFirstAmt ||
                              splitFirstNum <= 0 ||
                              splitFirstNum >= total)
                              ? "#ef4444"
                              : "#e5e7eb";
                        }}
                      />
                      {touched.split_first &&
                        (!splitFirstAmt || splitFirstNum <= 0) && (
                          <p style={errorStyle}>Ingresa un monto válido</p>
                        )}
                      {touched.split_first && splitFirstNum >= total && (
                        <p style={errorStyle}>
                          El monto debe ser menor al total ({formatPrice(total)}
                          )
                        </p>
                      )}
                    </div>

                    {/* ─── FIRST PAYMENT: CARD FORM ─── */}
                    {splitFirstMethod === "tarjeta" &&
                      splitFirstNum > 0 &&
                      splitFirstNum < total && (
                        <div
                          style={{
                            padding: 16,
                            borderRadius: 12,
                            marginBottom: 16,
                            background: "#fff",
                            border: "1px solid #e2e8f0",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              marginBottom: 14,
                            }}
                          >
                            <FaCreditCard
                              style={{ fontSize: 18, color: "#C10E1A" }}
                            />
                            <span style={{ fontWeight: 700, fontSize: 14 }}>
                              Datos de tarjeta (1° pago)
                            </span>
                          </div>
                          <div
                            style={{
                              background:
                                "linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #334155 100%)",
                              borderRadius: 14,
                              padding: 20,
                              marginBottom: 14,
                              color: "#fff",
                              minHeight: 250,
                              position: "relative",
                              overflow: "hidden",
                              boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                            }}
                          >
                            <div
                              style={{
                                position: "absolute",
                                top: -30,
                                right: -20,
                                width: 120,
                                height: 120,
                                borderRadius: "50%",
                                background: "rgba(255,255,255,0.04)",
                              }}
                            />
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                                marginBottom: 18,
                                position: "relative",
                                zIndex: 1,
                              }}
                            >
                              <div
                                style={{
                                  width: 32,
                                  height: 24,
                                  borderRadius: 3,
                                  background:
                                    "linear-gradient(135deg, #fbbf24, #d97706)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                                }}
                              >
                                <div
                                  style={{
                                    width: 22,
                                    height: 14,
                                    borderRadius: 2,
                                    border: "1.5px solid rgba(0,0,0,0.2)",
                                  }}
                                />
                              </div>
                              {getCardType(card.number) && (
                                <span>{getCardType(card.number)!.icon}</span>
                              )}
                            </div>
                            <div
                              style={{
                                fontSize: 22,
                                fontFamily: "'Courier New', monospace",
                                letterSpacing: 3,
                                marginBottom: 90,
                                position: "relative",
                                zIndex: 1,
                              }}
                            >
                              {card.number || "••••  ••••  ••••  ••••"}
                            </div>
                            <div
                              style={{
                                display: "flex",
                                gap: 24,
                                position: "relative",
                                zIndex: 1,
                              }}
                            >
                              <div style={{ flex: 1 }}>
                                <div
                                  style={{
                                    fontSize: 11,
                                    textTransform: "uppercase",
                                    letterSpacing: 1.5,
                                    opacity: 0.5,
                                    marginBottom: 1,
                                  }}
                                >
                                  Titular
                                </div>
                                <div
                                  style={{
                                    fontSize: 12,
                                    fontWeight: 600,
                                    textTransform: "uppercase",
                                    letterSpacing: 0.5,
                                    minHeight: 14,
                                  }}
                                >
                                  {card.holder || "NOMBRE"}
                                </div>
                              </div>
                              <div>
                                <div
                                  style={{
                                    fontSize: 11,
                                    textTransform: "uppercase",
                                    letterSpacing: 1.5,
                                    opacity: 0.5,
                                    marginBottom: 1,
                                  }}
                                >
                                  Vence
                                </div>
                                <div style={{ fontSize: 12, fontWeight: 600 }}>
                                  {card.expiry || "MM/AA"}
                                </div>
                              </div>
                              <div>
                                <div
                                  style={{
                                    fontSize: 11,
                                    textTransform: "uppercase",
                                    letterSpacing: 1.5,
                                    opacity: 0.5,
                                    marginBottom: 1,
                                  }}
                                >
                                  CVV
                                </div>
                                <div style={{ fontSize: 12, fontWeight: 600 }}>
                                  {card.cvv || "•••"}
                                </div>
                              </div>
                            </div>
                          </div>
                          {inputField(
                            "holder",
                            "Titular *",
                            card.holder,
                            (_, v) => updateCard("holder", v),
                            {
                              touchKey: "card_holder",
                              placeholder: "Como en la tarjeta",
                            },
                          )}
                          {inputField(
                            "number",
                            "Número *",
                            card.number,
                            (_, v) => updateCard("number", v),
                            {
                              touchKey: "card_number",
                              placeholder: "1234 5678 9012 3456",
                              maxLength: 19,
                            },
                          )}
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr",
                              gap: 10,
                            }}
                          >
                            {inputField(
                              "expiry",
                              "Vence *",
                              card.expiry,
                              (_, v) => updateCard("expiry", v),
                              {
                                touchKey: "card_expiry",
                                placeholder: "MM/AA",
                                maxLength: 5,
                              },
                            )}
                            {inputField(
                              "cvv",
                              "CVV *",
                              card.cvv,
                              (_, v) => updateCard("cvv", v),
                              {
                                touchKey: "card_cvv",
                                placeholder: "123",
                                maxLength: 4,
                              },
                            )}
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              padding: 10,
                              background: "#f0fdf4",
                              borderRadius: 8,
                              fontSize: 11,
                              color: "#166534",
                              marginTop: 10,
                            }}
                          >
                            <FaLock /> Simulación — datos no reales
                          </div>
                        </div>
                      )}

                    {/* ─── FIRST PAYMENT: CASH / EFECTIVO ─── */}
                    {splitFirstMethod === "efectivo" &&
                      splitFirstNum > 0 &&
                      splitFirstNum < total && (
                        <div
                          style={{
                            padding: 16,
                            borderRadius: 12,
                            marginBottom: 16,
                            background: "#fff",
                            border: "1px solid #e2e8f0",
                          }}
                        >
                          <div
                            style={{
                              fontWeight: 700,
                              fontSize: 14,
                              marginBottom: 10,
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            <FaYoutube style={{ color: "#eab308" }} /> Pago en
                            Efectivo (1° pago)
                          </div>
                          <div
                            style={{
                              background: "#fefce8",
                              border: "1px dashed #eab308",
                              borderRadius: 10,
                              padding: 16,
                              marginBottom: 10,
                              textAlign: "center",
                            }}
                          >
                            <div
                              style={{
                                fontSize: 11,
                                color: "#92400e",
                                marginBottom: 6,
                              }}
                            >
                              Código de pago simulado
                            </div>
                            <div
                              style={{
                                fontSize: 28,
                                fontWeight: 800,
                                letterSpacing: 6,
                                color: "#C10E1A",
                                fontFamily: "'Courier New', monospace",
                              }}
                            >
                              {splitCode}
                            </div>
                          </div>
                          <p style={{ fontSize: 11, color: "#888", margin: 0 }}>
                            Presenta este código en nuestras oficinas o al
                            recepcionista para realizar el pago en efectivo.
                          </p>
                        </div>
                      )}

                    {/* ─── SECOND PAYMENT ─── */}
                    {splitFirstNum > 0 && splitFirstNum < total && (
                      <div
                        style={{
                          padding: 16,
                          borderRadius: 12,
                          marginBottom: 16,
                          background: "#fff",
                          border: "1px solid #e5e7eb",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            marginBottom: 4,
                            color: "#111",
                          }}
                        >
                          2° Pago con{" "}
                          {splitFirstMethod === "tarjeta"
                            ? "Efectivo"
                            : "Tarjeta"}
                        </div>
                        <div
                          style={{
                            fontSize: 20,
                            fontWeight: 800,
                            color: "#C10E1A",
                            marginBottom: 14,
                          }}
                        >
                          {formatPrice(splitSecondNum)}
                        </div>
                        {splitFirstMethod === "tarjeta" ? (
                          <>
                            <div style={{ marginBottom: 12 }}>
                              <label style={labelStyle}>
                                Fecha estimada de pago *
                              </label>
                              <input
                                type="date"
                                value={splitSecondDate}
                                onChange={(e) => {
                                  setSplitSecondDate(e.target.value);
                                  t("split_date");
                                }}
                                style={{
                                  ...inputStyle,
                                  borderColor:
                                    touched.split_date && !splitSecondDate
                                      ? "#ef4444"
                                      : "#e5e7eb",
                                }}
                                onFocus={(e) =>
                                  (e.target.style.borderColor = "#C10E1A")
                                }
                                onBlur={(e) => {
                                  e.target.style.borderColor =
                                    touched.split_date && !splitSecondDate
                                      ? "#ef4444"
                                      : "#e5e7eb";
                                }}
                              />
                            </div>
                            <div>
                              <label style={labelStyle}>
                                ¿Cómo realizará el pago? *
                              </label>
                              <select
                                value={splitSecondDetails}
                                onChange={(e) => {
                                  setSplitSecondDetails(e.target.value);
                                  t("split_details");
                                }}
                                style={{
                                  ...inputStyle,
                                  borderColor:
                                    touched.split_details && !splitSecondDetails
                                      ? "#ef4444"
                                      : "#e5e7eb",
                                }}
                                onFocus={(e) =>
                                  (e.target.style.borderColor = "#C10E1A")
                                }
                                onBlur={(e) => {
                                  e.target.style.borderColor =
                                    touched.split_details && !splitSecondDetails
                                      ? "#ef4444"
                                      : "#e5e7eb";
                                }}
                              >
                                <option value="">Seleccionar...</option>
                                <option value="Pago en efectivo">
                                  Pago en efectivo
                                </option>
                                <option value="Pagar en oficina">
                                  Pagar en oficina
                                </option>
                              </select>
                            </div>
                          </>
                        ) : (
                          <>
                            <div style={{ marginBottom: 12 }}>
                              <label style={labelStyle}>
                                Fecha estimada de pago *
                              </label>
                              <input
                                type="date"
                                value={splitSecondDate}
                                onChange={(e) => {
                                  setSplitSecondDate(e.target.value);
                                  t("split_date");
                                }}
                                style={{
                                  ...inputStyle,
                                  borderColor:
                                    touched.split_date && !splitSecondDate
                                      ? "#ef4444"
                                      : "#e5e7eb",
                                }}
                                onFocus={(e) =>
                                  (e.target.style.borderColor = "#C10E1A")
                                }
                                onBlur={(e) => {
                                  e.target.style.borderColor =
                                    touched.split_date && !splitSecondDate
                                      ? "#ef4444"
                                      : "#e5e7eb";
                                }}
                              />
                            </div>
                            <div>
                              <label style={labelStyle}>
                                ¿Cómo realizará el pago? *
                              </label>
                              <select
                                value={splitSecondDetails}
                                onChange={(e) => {
                                  setSplitSecondDetails(e.target.value);
                                  t("split_details");
                                }}
                                style={{
                                  ...inputStyle,
                                  borderColor:
                                    touched.split_details && !splitSecondDetails
                                      ? "#ef4444"
                                      : "#e5e7eb",
                                }}
                                onFocus={(e) =>
                                  (e.target.style.borderColor = "#C10E1A")
                                }
                                onBlur={(e) => {
                                  e.target.style.borderColor =
                                    touched.split_details && !splitSecondDetails
                                      ? "#ef4444"
                                      : "#e5e7eb";
                                }}
                              >
                                <option value="">Seleccionar...</option>
                                <option value="Depósito bancario">
                                  Depósito bancario
                                </option>
                                <option value="Transferencia interbancaria">
                                  Transferencia interbancaria
                                </option>
                              </select>
                            </div>
                            <div
                              style={{
                                marginTop: 12,
                                padding: 12,
                                background: "#f0fdf4",
                                borderRadius: 8,
                                border: "1px solid #bbf7d0",
                                fontSize: 12,
                                color: "#166534",
                                lineHeight: 1.6,
                              }}
                            >
                              <strong>
                                Datos para depósito/transferencia:
                              </strong>
                              <br />
                              Banco: <strong>BCP</strong>
                              <br />
                              Cuenta Corriente:{" "}
                              <strong>191-2345678-0-00</strong>
                              <br />
                              CCI: <strong>002-191-123456780000-00</strong>
                              <br />
                              Titular: <strong>Ricardo Maza Apaza</strong>
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {/* ─── VALIDATION SUMMARY ─── */}
                    {splitFirstAmt && (
                      <div
                        style={{
                          padding: 12,
                          borderRadius: 8,
                          background: isSplitValid ? "#f0fdf4" : "#fef2f2",
                          color: isSplitValid ? "#166534" : "#ef4444",
                          fontSize: 13,
                          fontWeight: 600,
                          lineHeight: 1.6,
                        }}
                      >
                        {isSplitValid
                          ? `✓ Total: ${formatPrice(total)} → 1° ${splitFirstMethod === "tarjeta" ? "Tarjeta" : "Efectivo"}: ${formatPrice(splitFirstNum)} | 2° ${splitFirstMethod === "tarjeta" ? "Efectivo" : "Tarjeta"}: ${formatPrice(splitSecondNum)}`
                          : splitFirstNum >= total
                            ? `✗ El 1° pago (${formatPrice(splitFirstNum)}) debe ser menor al total (${formatPrice(total)})`
                            : `✗ Completa todos los datos del 2° pago (fecha y método)`}
                      </div>
                    )}
                  </div>
                )}

                <div
                  style={{
                    marginTop: 24,
                    padding: 20,
                    background: "#f8fafc",
                    borderRadius: 16,
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <h3
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      marginBottom: 16,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <FaCheck style={{ color: "#C10E1A", fontSize: 14 }} /> Tipo
                    de Comprobante
                  </h3>
                  <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                    {["boleta", "factura"].map((tipo) => (
                      <label
                        key={tipo}
                        style={{
                          flex: 1,
                          padding: "12px 16px",
                          border: `2px solid ${billing.type === tipo ? "#C10E1A" : "#e5e7eb"}`,
                          borderRadius: 10,
                          cursor: "pointer",
                          textAlign: "center",
                          background:
                            billing.type === tipo
                              ? "rgba(193,14,26,0.03)"
                              : "#fff",
                        }}
                      >
                        <input
                          type="radio"
                          name="billing"
                          value={tipo}
                          checked={billing.type === tipo}
                          onChange={() =>
                            setBilling((p) => ({ ...p, type: tipo }))
                          }
                          style={{ accentColor: "#C10E1A" }}
                        />
                        <span
                          style={{
                            fontWeight: 600,
                            fontSize: 14,
                            display: "block",
                            marginTop: 4,
                            textTransform: "capitalize",
                          }}
                        >
                          {tipo === "boleta" ? "Boleta" : "Factura"}
                        </span>
                        <span style={{ fontSize: 11, color: "#888" }}>
                          {tipo === "boleta" ? "Consumidor final" : "Con RUC"}
                        </span>
                      </label>
                    ))}
                  </div>
                  {billing.type === "factura" && (
                    <>
                      {inputField("ruc", "RUC *", billing.ruc, updateBilling, {
                        touchKey: "bill_ruc",
                        placeholder: "10 dígitos sin guiones",
                      })}
                      {inputField(
                        "name",
                        "Razón Social *",
                        billing.name,
                        updateBilling,
                        { touchKey: "bill_name" },
                      )}
                      {inputField(
                        "address",
                        "Dirección Fiscal",
                        billing.address,
                        updateBilling,
                        { touchKey: "bill_address", showErr: false },
                      )}
                    </>
                  )}
                </div>

                <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
                  <button
                    onClick={() => setStep("shipping")}
                    style={btnSecondary}
                  >
                    Atrás
                  </button>
                  <button
                    onClick={() => setStep("review")}
                    disabled={!isPaymentValid}
                    style={btnPrimary(!isPaymentValid)}
                  >
                    Revisar
                  </button>
                </div>
              </>
            )}

            {/* ========== REVIEW STEP ========== */}
            {step === "review" && (
              <>
                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>
                  Revisa tu Pedido
                </h2>
                <div style={{ marginBottom: 20 }}>
                  <h3
                    style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}
                  >
                    Información
                  </h3>
                  <p style={{ fontSize: 13, color: "#666" }}>
                    {form.name} · {form.email} · {form.phone}
                  </p>
                  {shippingMethod === "delivery" ? (
                    <p style={{ fontSize: 13, color: "#666" }}>
                      {form.address}, {form.city} {form.zip}
                    </p>
                  ) : (
                    <p style={{ fontSize: 13, color: "#666" }}>
                      Recojo en tienda
                    </p>
                  )}
                </div>
                <div style={{ marginBottom: 16 }}>
                  <h3
                    style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}
                  >
                    Productos
                  </h3>
                  {cart.items.map((item) => (
                    <div
                      key={item.productId}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 13,
                        padding: "6px 0",
                      }}
                    >
                      <span>
                        {item.title} × {item.quantity}
                      </span>
                      <span style={{ fontWeight: 600 }}>
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
                <div style={{ marginBottom: 16 }}>
                  <h3
                    style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}
                  >
                    Pago
                  </h3>
                  <p style={{ fontSize: 13, color: "#666" }}>
                    {{
                      yape: "Yape / Plin",
                      plin: "Yape / Plin",
                      visa: "Visa",
                      mastercard: "Mastercard",
                      paypal: "PayPal",
                      mercadopago: "Mercado Pago",
                      mixto: "Mixto (Tarjeta + Efectivo)",
                    }[paymentMethod] || paymentMethod}
                    {isCardMethod && ` · ${card.holder}`}
                    {isYapeMethod && yapeCode && ` · Código: ${yapeCode}`}
                    {isMixedMethod &&
                      ` · 1° ${splitFirstMethod === "tarjeta" ? "Tarjeta" : "Efectivo"}: ${formatPrice(splitFirstNum)} | 2° ${splitFirstMethod === "tarjeta" ? "Efectivo" : "Tarjeta"}: ${formatPrice(Math.max(0, splitSecondNum))}${splitSecondDate ? ` (${splitSecondDate})` : ""}${splitSecondDetails ? ` - ${splitSecondDetails}` : ""}`}
                  </p>
                </div>
                <div style={{ marginBottom: 20 }}>
                  <h3
                    style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}
                  >
                    Comprobante
                  </h3>
                  <p style={{ fontSize: 13, color: "#666" }}>
                    {billing.type === "boleta"
                      ? "Boleta (Consumidor final)"
                      : `Factura (RUC: ${billing.ruc} - ${billing.name})`}
                  </p>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: 16,
                    background: loading ? "#ccc" : "#C10E1A",
                    color: "#fff",
                    border: "none",
                    borderRadius: 12,
                    fontSize: 16,
                    fontWeight: 700,
                    cursor: loading ? "not-allowed" : "pointer",
                    fontFamily: "'Poppins', sans-serif",
                  }}
                >
                  {loading
                    ? simulatingPayment
                      ? "Procesando pago..."
                      : "Procesando..."
                    : isMpPayment
                      ? `Pagar con Mercado Pago — ${formatPrice(total)}`
                      : isPaypalMethod
                        ? `Pagar con PayPal — ${formatPrice(total)}`
                        : `Confirmar Pedido — ${formatPrice(total)}`}
                </button>
              </>
            )}
          </div>

          {/* Sidebar */}
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              padding: 24,
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              height: "fit-content",
              position: "sticky",
              top: 30,
            }}
          >
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
              Resumen del Pedido
            </h3>
            {cart.items.map((item) => (
              <div
                key={item.productId}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 13,
                  padding: "6px 0",
                  color: "#666",
                }}
              >
                <span>
                  {item.title} × {item.quantity}
                </span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
            <div
              style={{
                borderTop: "1px solid #f0f0f0",
                marginTop: 12,
                paddingTop: 12,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 13,
                  color: "#666",
                  marginBottom: 4,
                }}
              >
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 13,
                  color: "#666",
                  marginBottom: 4,
                }}
              >
                <span>IGV (18%)</span>
                <span>{formatPrice(tax)}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 13,
                  color: "#666",
                  marginBottom: 4,
                }}
              >
                <span>Envío</span>
                <span>{shipping === 0 ? "Gratis" : formatPrice(shipping)}</span>
              </div>
              {cart.discount > 0 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 13,
                    color: "#10b981",
                    marginBottom: 4,
                  }}
                >
                  <span>Descuento</span>
                  <span>-{formatPrice(cart.discount)}</span>
                </div>
              )}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 18,
                  fontWeight: 800,
                  color: "#111",
                  paddingTop: 10,
                  borderTop: "1px solid #e5e7eb",
                  marginTop: 6,
                }}
              >
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
