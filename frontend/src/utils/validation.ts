"use server";

export const validateEmail = async (
  email: string
): Promise<{ success: boolean; message: string; status?: number }> => {
  const regex = /^[A-Z0-9._%+-]+@(?:[A-Z0-9-]+\.)+[A-Z]{2,}$/i;
  if (!regex.test(email)) {
    return { success: false, message: "Enter a valid email address" };
  }
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/is-email-available`, {
      method: "POST",
      body: JSON.stringify({ email }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    return await res.json();
  } catch (error) {
    return {
      success: false,
      status: 500,
      message: "Internal Server Error.",
    };
  }
};

export const validatePassword = async (
  password: string
): Promise<{ success: boolean; message: string }> => {
  if (password.length < 6) {
    return {
      success: false,
      message: "Password must be at least 6 characters long",
    };
  }
  return { success: true,  message: "" };
};

export const validateUsername = async (
  username: string
): Promise<{ success: boolean; message: string; status?: number }> => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/user/is-username-available`,
      {
        method: "POST",
        body: JSON.stringify({ username }),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return await res.json();
  } catch (error) {
    return {
      success: false,
      status: 500,
      message: "Internal server error.",
    };
  }
};
