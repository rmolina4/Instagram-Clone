export const validateEmail = async (email: string): Promise<string | null> => {
  const regex = /^[A-Z0-9._%+-]+@(?:[A-Z0-9-]+\.)+[A-Z]{2,}$/i;
  if(!regex.test(email)) {
    return "Enter a valid email address";
  }
  try {
    const res = await fetch("http://localhost:8080/user/is-email-available", {
      method: "POST",
      body: JSON.stringify({ email }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    if (!res.ok) {
      return data.message;
    }
    return null;
  } catch (error) {
    return "An unexpected error occurred. Please try again.";
  }
};

export const validatePassword = async (password: string): Promise<string | null> => {
  if(password.length < 6) {
    return "Password must be at least 6 characters long";
  }
  return null;
};

export const validateUsername = async (username: string): Promise<string | null> => {
    try {
        const res = await fetch("http://localhost:8080/user/is-username-available", {
            method: "POST",
            body: JSON.stringify({ username }),
            headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (!res.ok) {
        return data.message;
    }
    return null;
    } catch (error) {
        return "An unexpected error occurred. Please try again.";
    }
}; 