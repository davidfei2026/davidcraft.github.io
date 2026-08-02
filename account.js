const SUPABASE_URL =
  "https://dvzxdpdphtuolotzwqng.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable__xk8_N3V1OES05XcLOMTDA_IB3opJmD";

const ACCOUNT_URL =
  "https://davidfei2026.github.io/davidcraft.github.io/account.html";

if (!window.supabase) {
  throw new Error(
    "Supabase did not load. Check the Supabase CDN script in account.html."
  );
}

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);

/* ---------------------------------------
   PAGE ELEMENTS
--------------------------------------- */

const authView = document.getElementById("auth-view");
const profileView = document.getElementById("profile-view");
const recoveryView = document.getElementById("recovery-view");

const authStatus = document.getElementById("auth-status");
const profileStatus = document.getElementById("profile-status");
const recoveryStatus = document.getElementById("recovery-status");

const passwordTab = document.getElementById("password-tab");
const emailTab = document.getElementById("email-tab");

const passwordPanel = document.getElementById("password-panel");
const emailPanel = document.getElementById("email-panel");

const passwordForm = document.getElementById("password-form");
const passwordEmail = document.getElementById("password-email");
const passwordInput = document.getElementById("password");

const loginButton = document.getElementById("login-button");
const signupButton = document.getElementById("signup-button");
const forgotButton = document.getElementById("forgot-button");

const emailLinkForm = document.getElementById("email-link-form");
const linkEmail = document.getElementById("link-email");

const otpForm = document.getElementById("otp-form");
const otpCode = document.getElementById("otp-code");

const googleButton = document.getElementById("google-button");
const logoutButton = document.getElementById("logout-button");

const recoveryForm = document.getElementById("recovery-form");
const newPassword = document.getElementById("new-password");

/* ---------------------------------------
   HELPERS
--------------------------------------- */

function showStatus(element, message, type = "") {
  if (!element) {
    return;
  }

  element.textContent = message;
  element.className = `status show ${type}`.trim();
}

function clearStatus(element) {
  if (!element) {
    return;
  }

  element.textContent = "";
  element.className = "status";
}

function setBusy(button, busy, busyText = "Please wait…") {
  if (!button) {
    return;
  }

  if (busy) {
    button.dataset.originalText = button.textContent;
    button.textContent = busyText;
    button.disabled = true;
  } else {
    button.textContent =
      button.dataset.originalText || button.textContent;

    button.disabled = false;
  }
}

function switchTab(tabName) {
  const passwordIsActive = tabName === "password";

  passwordTab?.classList.toggle(
    "active",
    passwordIsActive
  );

  emailTab?.classList.toggle(
    "active",
    !passwordIsActive
  );

  passwordPanel?.classList.toggle(
    "active",
    passwordIsActive
  );

  emailPanel?.classList.toggle(
    "active",
    !passwordIsActive
  );
}

/* ---------------------------------------
   PROFILE
--------------------------------------- */

function renderSession(session) {
  const user = session?.user;

  if (!user) {
    if (authView) {
      authView.hidden = false;
    }

    profileView?.classList.remove("show");
    recoveryView?.classList.remove("show");

    return;
  }

  if (authView) {
    authView.hidden = true;
  }

  recoveryView?.classList.remove("show");
  profileView?.classList.add("show");

  const metadata = user.user_metadata || {};

  const displayName =
    metadata.full_name ||
    metadata.name ||
    user.email?.split("@")[0] ||
    "DavidCraft user";

  const profileName =
    document.getElementById("profile-name");

  const profileEmail =
    document.getElementById("profile-email");

  const avatar =
    document.getElementById("avatar");

  if (profileName) {
    profileName.textContent = displayName;
  }

  if (profileEmail) {
    profileEmail.textContent = user.email || "";
  }

  if (!avatar) {
    return;
  }

  if (metadata.avatar_url) {
    avatar.innerHTML = "";

    const image = document.createElement("img");

    image.src = metadata.avatar_url;
    image.alt = `${displayName} profile picture`;

    avatar.appendChild(image);
  } else {
    const initials = displayName
      .split(/\s+/)
      .map((part) => part.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase();

    avatar.textContent = initials || "DC";
  }
}

/* ---------------------------------------
   TABS
--------------------------------------- */

passwordTab?.addEventListener("click", () => {
  switchTab("password");
});

emailTab?.addEventListener("click", () => {
  switchTab("email");
});

/* ---------------------------------------
   GOOGLE SIGN-IN
--------------------------------------- */

googleButton?.addEventListener("click", async () => {
  clearStatus(authStatus);
  setBusy(googleButton, true, "Opening Google…");

  const { error } =
    await supabaseClient.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: ACCOUNT_URL
      }
    });

  if (error) {
    setBusy(googleButton, false);

    showStatus(
      authStatus,
      error.message,
      "error"
    );
  }
});

/* ---------------------------------------
   PASSWORD LOGIN
--------------------------------------- */

passwordForm?.addEventListener(
  "submit",
  async (event) => {
    event.preventDefault();

    clearStatus(authStatus);
    setBusy(loginButton, true, "Logging in…");

    const { error } =
      await supabaseClient.auth.signInWithPassword({
        email: passwordEmail.value.trim(),
        password: passwordInput.value
      });

    setBusy(loginButton, false);

    if (error) {
      showStatus(
        authStatus,
        error.message,
        "error"
      );

      return;
    }

    showStatus(
      authStatus,
      "You are signed in.",
      "success"
    );
  }
);

/* ---------------------------------------
   CREATE ACCOUNT
--------------------------------------- */

signupButton?.addEventListener(
  "click",
  async () => {
    clearStatus(authStatus);

    if (
      !passwordEmail.reportValidity() ||
      !passwordInput.reportValidity()
    ) {
      return;
    }

    setBusy(signupButton, true, "Creating…");

    const { data, error } =
      await supabaseClient.auth.signUp({
        email: passwordEmail.value.trim(),
        password: passwordInput.value,
        options: {
          emailRedirectTo: ACCOUNT_URL
        }
      });

    setBusy(signupButton, false);

    if (error) {
      showStatus(
        authStatus,
        error.message,
        "error"
      );

      return;
    }

    if (data.session) {
      showStatus(
        authStatus,
        "Account created. You are signed in.",
        "success"
      );
    } else {
      showStatus(
        authStatus,
        "Account created. Check your email to confirm your account.",
        "success"
      );
    }
  }
);

/* ---------------------------------------
   EMAIL SIGN-IN LINK
--------------------------------------- */

emailLinkForm?.addEventListener(
  "submit",
  async (event) => {
    event.preventDefault();

    clearStatus(authStatus);

    const button =
      emailLinkForm.querySelector(
        'button[type="submit"]'
      );

    setBusy(button, true, "Sending…");

    const { error } =
      await supabaseClient.auth.signInWithOtp({
        email: linkEmail.value.trim(),
        options: {
          emailRedirectTo: ACCOUNT_URL,
          shouldCreateUser: true
        }
      });

    setBusy(button, false);

    if (error) {
      showStatus(
        authStatus,
        error.message,
        "error"
      );

      return;
    }

    showStatus(
      authStatus,
      "Email sent. Open the message and click the sign-in link.",
      "success"
    );
  }
);

/* ---------------------------------------
   VERIFY NUMERIC OTP
--------------------------------------- */

otpForm?.addEventListener(
  "submit",
  async (event) => {
    event.preventDefault();

    clearStatus(authStatus);

    const email = linkEmail.value.trim();
    const token = otpCode.value.trim();

    if (!email) {
      showStatus(
        authStatus,
        "Enter your email above first.",
        "error"
      );

      return;
    }

    if (!token) {
      showStatus(
        authStatus,
        "Enter the one-time code.",
        "error"
      );

      return;
    }

    const button =
      otpForm.querySelector(
        'button[type="submit"]'
      );

    setBusy(button, true, "Verifying…");

    const { error } =
      await supabaseClient.auth.verifyOtp({
        email,
        token,
        type: "email"
      });

    setBusy(button, false);

    if (error) {
      showStatus(
        authStatus,
        error.message,
        "error"
      );

      return;
    }

    showStatus(
      authStatus,
      "Code verified. You are signed in.",
      "success"
    );
  }
);

/* ---------------------------------------
   FORGOT PASSWORD
--------------------------------------- */

forgotButton?.addEventListener(
  "click",
  async () => {
    clearStatus(authStatus);

    const email = passwordEmail.value.trim();

    if (!email) {
      showStatus(
        authStatus,
        "Enter your email first.",
        "error"
      );

      passwordEmail.focus();
      return;
    }

    setBusy(
      forgotButton,
      true,
      "Sending reset email…"
    );

    const { error } =
      await supabaseClient.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: ACCOUNT_URL
        }
      );

    setBusy(forgotButton, false);

    if (error) {
      showStatus(
        authStatus,
        error.message,
        "error"
      );

      return;
    }

    showStatus(
      authStatus,
      "Password reset email sent.",
      "success"
    );
  }
);

/* ---------------------------------------
   UPDATE PASSWORD
--------------------------------------- */

recoveryForm?.addEventListener(
  "submit",
  async (event) => {
    event.preventDefault();

    clearStatus(recoveryStatus);

    const button =
      recoveryForm.querySelector(
        'button[type="submit"]'
      );

    setBusy(button, true, "Updating…");

    const { error } =
      await supabaseClient.auth.updateUser({
        password: newPassword.value
      });

    setBusy(button, false);

    if (error) {
      showStatus(
        recoveryStatus,
        error.message,
        "error"
      );

      return;
    }

    newPassword.value = "";

    showStatus(
      recoveryStatus,
      "Password updated successfully.",
      "success"
    );

    const { data } =
      await supabaseClient.auth.getSession();

    renderSession(data.session);
  }
);

/* ---------------------------------------
   LOG OUT
--------------------------------------- */

logoutButton?.addEventListener(
  "click",
  async () => {
    clearStatus(profileStatus);
    setBusy(logoutButton, true, "Logging out…");

    const { error } =
      await supabaseClient.auth.signOut();

    setBusy(logoutButton, false);

    if (error) {
      showStatus(
        profileStatus,
        error.message,
        "error"
      );
    }
  }
);

/* ---------------------------------------
   AUTH EVENTS
--------------------------------------- */

supabaseClient.auth.onAuthStateChange(
  (event, session) => {
    if (event === "PASSWORD_RECOVERY") {
      if (authView) {
        authView.hidden = true;
      }

      profileView?.classList.remove("show");
      recoveryView?.classList.add("show");

      return;
    }

    renderSession(session);
  }
);

/* ---------------------------------------
   INITIAL SESSION
--------------------------------------- */

async function initializeAccountPage() {
  const { data, error } =
    await supabaseClient.auth.getSession();

  if (error) {
    showStatus(
      authStatus,
      error.message,
      "error"
    );
  }

  renderSession(data.session);
}

initializeAccountPage();
