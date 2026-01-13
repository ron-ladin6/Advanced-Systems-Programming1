import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomInput from "../components/CustomInput";
import CustomButton from "../components/CustomButton";
import "../components/Components.css";
import "../components/AuthPages.css";

const RegisterPage = () => {
  const navigate = useNavigate();
  // State variables for form inputs and error message
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verifyPassword, setVerifyPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [pictureDataUrl, setPictureDataUrl] = useState("");
  const [errorMessage, setErrorMessage] = useState({});
  const [serverError, setServerError] = useState("");

  // check if the first password (not the verify password) is valid (length, uppercase letter, number).
  const validatePassword = (password) => {
    if (!password) {
      return "you must enter a password";
    }
    if (password.length < 8 && password.length > 0) {
      return "password must be at least 8 characters";
    }
    if (!/[A-Z]/.test(password) && password.length >= 8) {
      return "password must contain at least one uppercase letter";
    }
    if (!/[0-9]/.test(password) && password.length >= 8) {
      return "password must contain at least one number";
    }
    //if all checks passed
    return null;
  };
  // validate all inputs and set error messages
  const validate = () => {
    let error = {};
    if (!userName) {
      error.userName = "you must enter a user name";
    }
    if (!email) {
      error.email = "you must enter an email";
    }
    const passwordErr = validatePassword(password);
    if (passwordErr) {
      error.password = passwordErr;
    }
    if (password !== verifyPassword) {
      error.verifyPassword = "these passwords should be the same";
    }

    // set the error message state
    setErrorMessage(error);
    return Object.keys(error).length === 0;
  };
  // handle profile picture selection and preview
  const handlePictureChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // only images
    if (!file.type.startsWith("image/")) {
      setErrorMessage((prev) => ({ ...prev, picture: "please choose an image file" }));
      return;
    }
    // preview the image
    const reader = new FileReader();
    reader.onload = () => {
      setPictureDataUrl(String(reader.result || ""));
      setErrorMessage((prev) => {
        const copy = { ...prev };
        delete copy.picture;
        return copy;
      });
    };
    reader.readAsDataURL(file);
  };
  // handle form submission
  const submit = async (e) => {
    e.preventDefault();
    setServerError("");
    // validate inputs
    if (validate()) {
      const finalDisplay = displayName ? displayName : userName;
      // default picture so user can choose not to upload one
      const defaultBase64 =
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";
      // if user didn't choose a picture -> use default
      const profilePic = pictureDataUrl ? pictureDataUrl : defaultBase64;
      // prepare user data
      const newUser = {
        username: userName,
        password: password,
        email: email,
        displayName: finalDisplay,
        profilePictureURL: profilePic,
        verifyPassword: verifyPassword,
      };
      // send registration request
      try {
        const response = await fetch("http://localhost:5000/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newUser),
        });

        if (response.ok) {
          navigate("/login");
          return;
        }

        // minimal but clear server messages by status
        if (response.status === 409) {
          setServerError("Username or email already exists.");
        } else if (response.status === 400) {
          setServerError("Invalid registration details. Please check the form.");
        } else {
          setServerError(`Registration failed (${response.status}).`);
        }
      } catch (error) {
        setServerError("Network error. Is the server running?");
      }
    }
  };

  return (
    <div className="register-container">
      <h2>Register</h2>

      {/* server error (minimal) */}
      {serverError && <p className="error-message">{serverError}</p>}

      <form onSubmit={submit}>
        <CustomInput
          label="User Name"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          error={errorMessage.userName}
        />
        <CustomInput
          label="Display Name (optional)"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
        <CustomInput
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errorMessage.password}
        />
        <CustomInput
          label="Verify Password"
          type="password"
          value={verifyPassword}
          onChange={(e) => setVerifyPassword(e.target.value)}
          error={errorMessage.verifyPassword}
        />
        <CustomInput
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errorMessage.email}
        />

        {/* picture picker (not required) */}
        <div style={{ width: "100%", marginTop: "10px" }}>
          <label style={{ display: "block", marginBottom: "6px" }}>Profile Picture (optional)</label>
          <input type="file" accept="image/*" onChange={handlePictureChange} />
          {errorMessage.picture && (
            <div style={{ color: "red", marginTop: "6px" }}>{errorMessage.picture}</div>
          )}
          {(pictureDataUrl || true) && (
            <img
              src={
                pictureDataUrl ||
                "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
              }
              alt="preview"
              style={{
                marginTop: "10px",
                width: "80px",
                height: "80px",
                objectFit: "cover",
                borderRadius: "50%",
              }}
            />
          )}
        </div>
        <CustomButton text="Register" type="submit" onClick={() => {}} />
      </form>
      <div style={{ marginTop: "15px" }}>
        Already have an account?{" "}
        <span style={{ color: "#007bff", cursor: "pointer" }} onClick={() => navigate("/login")}>
          Log in here
        </span>
      </div>
    </div>
  );
};

export default RegisterPage;