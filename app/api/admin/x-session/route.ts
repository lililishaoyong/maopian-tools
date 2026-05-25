import { NextRequest } from "next/server";
import { redirectToAdmin } from "@/lib/admin-redirect";
import { saveXSession } from "@/lib/data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const action = String(form.get("action") || "save");

  try {
    if (action === "clear") {
      await saveXSession({ cookieText: "", updatedAt: "", isConfigured: false });
      return redirectToAdmin("/admin/creators?ok=session-cleared");
    }

    const cookieText = String(form.get("cookieText") || "").trim();
    if (!cookieText || !cookieText.includes("=")) {
      throw new Error("请粘贴有效的 Cookie 文本。");
    }

    await saveXSession({
      cookieText,
      updatedAt: new Date().toISOString(),
      isConfigured: true
    });
    return redirectToAdmin("/admin/creators?ok=session-saved");
  } catch (error) {
    return redirectToAdmin(`/admin/creators?error=${encodeURIComponent(errorMessage(error))}`);
  }
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "X Cookie 保存失败。";
}
