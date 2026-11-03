"""Browser interaction checks; chat/STT responses are mocked unless --live is supplied."""
import argparse
import asyncio
import json
from pathlib import Path
import sys
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))

from playwright.async_api import async_playwright, expect
from app.config import BACKEND, REPOSITORY
from app.corpus import Corpus

SOURCE="https://baotanglichsu.vn/vi/Articles/1001/28538/bao-vat-quoc-gia-viet-nam-trong-djong-ngoc-lu.html"
DAGGER_SOURCE="https://baotanglichsu.vn/vi/Articles/3101/76005/van-hoa-djong-son-chien-tranh-va-hoa-binh-ky-22-nhung-luoi-dao-gam-mang-djay-tinh-bieu-trung.html"


def answer(artifact):
    text={"drum":"Trống Ngọc Lũ cao 63 cm.","jar":"Thạp Đào Thịnh cao 98 cm.","dagger":"Dao găm là mô hình minh họa."}[artifact]
    return {"artifact_id":artifact,"status":"answered","answer":text+" [1]","citations":[{
        "number":1,"chunk_id":"test-size","title":"Bảo tàng Lịch sử Quốc gia","url":SOURCE,"section":"Kích thước","excerpt":text}],
        "elapsed_ms":100,"usage":{},"corpus_version":"browser-test"}


async def main(live):
    checks=[]
    screenshots=REPOSITORY/"docs"/"screenshots"; screenshots.mkdir(parents=True,exist_ok=True)
    async with async_playwright() as pw:
        browser=await pw.chromium.launch(channel="msedge",headless=True,args=[
            "--use-angle=swiftshader","--enable-unsafe-swiftshader","--use-fake-ui-for-media-stream","--use-fake-device-for-media-stream"])
        context=await browser.new_context(viewport={"width":1440,"height":1000})
        page=await context.new_page()
        async def chat_route(route):
            body=route.request.post_data_json
            if body["question"]=="Test mất kết nối":
                await route.fulfill(json={"artifact_id":body["artifact_id"],"status":"temporarily_unavailable","answer":"Mình đang gặp trục trặc kết nối. Bạn thử lại nhé.","citations":[],"elapsed_ms":100,"usage":{},"corpus_version":"browser-test"})
                return
            if body["question"]=="Test lỗi":
                await route.fulfill(status=503,json={"detail":"Dịch vụ đang bận. Hãy thử lại."})
                return
            if body["question"]=="Test chậm":
                await asyncio.sleep(1.5)
            try:
                await route.fulfill(json=answer(body["artifact_id"]))
            except Exception:
                # A scope switch intentionally aborts the request.
                pass
        await page.route("**/api/chat",chat_route)
        await page.route("**/api/transcribe",lambda route:route.fulfill(json={"text":"Trống Ngọc Lũ cao bao nhiêu?","usage":{}}))
        await page.goto("http://127.0.0.1:5173/",wait_until="domcontentloaded")
        health=await page.request.get("http://127.0.0.1:5173/api/health")
        assert health.status==200 and (await health.json())["index_ready"]
        checks.append("Vite proxy reaches the real indexed backend")
        await page.get_by_role("button",name="Mở trợ lý AI").click()
        field=page.get_by_label("Câu hỏi của bạn")
        await expect(field).to_be_disabled()
        checks.append("No selected artifact: question input disabled with guidance")
        await page.get_by_role("button",name="01 · Trống đồng Ngọc Lũ",exact=True).click()
        await field.fill("Cao bao nhiêu?")
        await field.press("Enter")
        await expect(page.locator(".chat-message.is-assistant").last).to_contain_text("63 cm")
        await page.get_by_text("Nguồn tham khảo (1)",exact=True).click()
        await expect(page.locator(".chat-citation a")).to_have_attribute("href",SOURCE)
        checks.append("Chat sends current artifact ID and renders a source link")
        await field.fill("Test lỗi"); await field.press("Enter")
        await expect(page.get_by_role("alert")).to_contain_text("Dịch vụ đang bận")
        await expect(field).to_have_value("Test lỗi")
        checks.append("API failure preserves question and shows a recovery message")
        await field.fill("Test mất kết nối"); await field.press("Enter")
        await expect(page.locator(".chat-message.is-assistant").last).to_contain_text("trục trặc kết nối")
        await expect(field).to_have_value("Test mất kết nối")
        checks.append("Provider outage is explained conversationally and keeps the question ready to retry")
        await field.fill("Test chậm"); await field.press("Enter")
        await page.get_by_role("button",name="Dừng chờ",exact=True).click()
        await expect(field).to_have_value("Test chậm")
        await expect(page.get_by_role("button",name="Gửi câu hỏi")).to_be_enabled()
        checks.append("Visitor can cancel a pending response and edit the preserved question")
        await field.fill("Test chậm"); await field.press("Enter")
        await page.get_by_role("button",name="02 · Thạp đồng Đào Thịnh",exact=True).click()
        await expect(page.locator(".chat-messages")).not_to_contain_text("63 cm")
        await field.fill("Thạp cao bao nhiêu?"); await field.press("Enter")
        await expect(page.locator(".chat-message.is-assistant").last).to_contain_text("98 cm")
        await asyncio.sleep(1.7)
        await expect(page.locator(".chat-messages")).not_to_contain_text("63 cm")
        checks.append("Changing artifact while a response is pending does not leak the old answer")
        await page.get_by_role("button",name="01 · Trống đồng Ngọc Lũ",exact=True).click()
        await expect(page.locator(".chat-messages")).to_contain_text("63 cm")
        checks.append("Each artifact keeps its own visible conversation")
        await page.get_by_role("button",name="Bấm để ghi",exact=True).click()
        await expect(page.get_by_role("button",name="Dừng",exact=True)).to_be_visible(timeout=10000)
        await asyncio.sleep(1)
        await page.get_by_role("button",name="Dừng",exact=True).click()
        await expect(field).to_have_value("Trống Ngọc Lũ cao bao nhiêu?",timeout=10000)
        checks.append("Synthetic microphone + mocked STT fills an editable question")
        await page.screenshot(path=str(screenshots/"chat-desktop.png"),full_page=True)

        await page.set_viewport_size({"width":390,"height":844})
        await page.get_by_role("button",name="03 · Dao găm đồng Đông Sơn",exact=True).click()
        await expect(field).to_be_visible()
        assert await page.evaluate("document.documentElement.scrollWidth <= innerWidth")
        await page.screenshot(path=str(screenshots/"chat-mobile.png"),full_page=True)
        checks.append("Mobile layout has an accessible composer and no horizontal page overflow")
        await page.set_viewport_size({"width":1440,"height":1000})

        admin=await context.new_page()
        corpus=Corpus(BACKEND/"data"/"corpus.json")
        async def admin_corpus_route(route):
            if route.request.headers.get("authorization") != "Bearer browser-test-token":
                await route.fulfill(status=401,json={"detail":"Unauthorized"})
            else:
                await route.fulfill(json={**corpus.data,"version":corpus.version})
        await admin.route("**/api/admin/corpus",admin_corpus_route)
        await admin.goto("http://127.0.0.1:5173/?sandbox",wait_until="domcontentloaded")
        await expect(admin.locator("#sandbox-token")).to_be_visible()
        await admin.locator("#sandbox-token").fill("browser-test-token")
        await admin.locator(".sandbox-login button[type=submit]").click()
        await expect(admin.locator("#sandbox-artifact")).to_be_visible()
        checks.append("Sandbox requires an admin token and loads the real source corpus")
        async def admin_route(route):
            body=route.request.post_data_json
            await route.fulfill(json={"response":answer(body["artifact_id"]),"debug":{
                "retrieval_query":body["question"],"evidence":[{"chunk_id":"NL-01-size","text":"Trống Ngọc Lũ cao 63 cm.","distance":0.15}],"answer_mode":"validated_excerpts"}})
        await admin.route("**/api/admin/chat",admin_route)
        await admin.get_by_role("button",name="Chạy thử",exact=True).click()
        await expect(admin.locator(".sandbox-answer")).to_contain_text("63 cm")
        await expect(admin.locator(".sandbox-evidence")).to_contain_text("NL-01-size")
        await admin.screenshot(path=str(screenshots/"sandbox.png"),full_page=True)
        checks.append("Sandbox shows the answer and retrieved evidence")
        if live:
            await page.unroute("**/api/chat",chat_route)
            await page.get_by_role("button",name="01 · Trống đồng Ngọc Lũ",exact=True).click()
            await field.fill("Trống Ngọc Lũ cao bao nhiêu?"); await field.press("Enter")
            await expect(page.locator(".chat-message.is-assistant").last).to_contain_text("63 cm",timeout=90000)
            checks.append("Real source-backed answer rendered through the frontend and backend")
            await field.fill("Kể một điều thú vị về hiện vật này nhé")
            async with page.expect_response(lambda response: response.url.endswith("/api/chat") and response.request.method=="POST",timeout=22000) as generated:
                await field.press("Enter")
            generated_body=await (await generated.value).json()
            assert generated_body["status"]=="answered" and generated_body["usage"].get("input_tokens",0)>0
            assert "[1]" not in generated_body["answer"]
            await expect(page.locator(".chat-message.is-assistant").last.locator("p").first).to_have_text(generated_body["answer"])
            checks.append("Live Gemini writes a conversational answer while source details remain expandable")
            await page.get_by_role("button",name="03 · Dao găm đồng Đông Sơn",exact=True).click()
            await field.fill("cais nay la cai gi vay"); await field.press("Enter")
            identity=page.locator(".chat-message.is-assistant").last
            await expect(identity).to_contain_text("mô hình minh họa",timeout=15000)
            await field.fill("cais nay duoc lam tu gi"); await field.press("Enter")
            material=page.locator(".chat-message.is-assistant").last
            await expect(material).to_contain_text("đồng",timeout=15000)
            assert "tự vệ" not in (await material.inner_text()).lower()
            await material.get_by_text("Nguồn tham khảo (1)",exact=True).click()
            await expect(material.locator(".chat-citation a")).to_have_attribute("href",DAGGER_SOURCE)
            checks.append("Exact Telex identity and material questions return separate, relevant answers")
            await field.fill("Hiện vật được dùng làm gì?"); await field.press("Enter")
            use_answer=page.locator(".chat-message.is-assistant").last
            await expect(use_answer).to_contain_text("tự vệ",timeout=5000)
            assert "[1]" not in await use_answer.locator("p").first.inner_text()
            await field.fill("cái dao này được làm từ bao giờ"); await field.press("Enter")
            await expect(page.locator(".chat-message.is-assistant").last).to_contain_text("chưa có niên đại",timeout=5000)
            checks.append("Purpose and unknown dagger date answer promptly in a conversational tone")
            await page.get_by_role("button",name="02 · Thạp đồng Đào Thịnh",exact=True).click()
            await field.fill("Hoa văn có gì đặc biệt?"); await field.press("Enter")
            await expect(page.locator(".chat-message.is-assistant").last).to_contain_text("12 tia",timeout=5000)
            await field.fill("hoa văn đc lấy ý tưởng từ đâu"); await field.press("Enter")
            inspiration=page.locator(".chat-message.is-assistant").last.locator("p").first
            await expect(inspiration).to_contain_text("tín ngưỡng",timeout=5000)
            assert "12 tia" not in await inspiration.inner_text()
            assert "chưa có ghi chép" in (await inspiration.inner_text()).lower()
            checks.append("Exact ornament inspiration follow-up answers its meaning and limits, not the previous count paragraph")
            await field.fill("Chiều cao thạp bao nhiêu?"); await field.press("Enter")
            height=page.locator(".chat-message.is-assistant").last.locator("p").first
            await expect(height).to_contain_text("98 cm",timeout=5000)
            height_text=await height.inner_text()
            assert all(value in height_text for value in ("87 cm","90 cm"))
            checks.append("Conflicting museum measurements are disclosed instead of choosing a single value")
            await page.screenshot(path=str(screenshots/"chat-live.png"),full_page=True)
        await browser.close()
    report={"checks":checks,"passed":len(checks),"interaction_responses_mocked":True,"live_chat_checked":live,"browser_stt_mocked":True,
            "note":"Interaction checks use mocked responses and synthetic audio; live API evaluation is reported separately. Physical microphone quality still needs a human test."}
    (REPOSITORY/"docs"/"browser-checks.json").write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding="utf-8")
    print(json.dumps(report,ensure_ascii=False,indent=2))


if __name__=="__main__":
    parser=argparse.ArgumentParser(); parser.add_argument("--live",action="store_true")
    asyncio.run(main(parser.parse_args().live))
