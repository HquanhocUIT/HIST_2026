"""Record real browser interactions and Gemini responses. The video has no narration."""
import argparse
import asyncio
import json
import os
from pathlib import Path
import sys
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from playwright.async_api import async_playwright, expect
from app.config import REPOSITORY

os.environ.setdefault("PLAYWRIGHT_BROWSERS_PATH", str(REPOSITORY.parent / ".venv" / "playwright-browsers"))


async def main():
    output=REPOSITORY/"docs"/"demo"; output.mkdir(parents=True,exist_ok=True)
    results=[]
    async with async_playwright() as pw:
        browser=await pw.chromium.launch(channel="msedge",headless=True,args=["--use-angle=swiftshader","--enable-unsafe-swiftshader"])
        context=await browser.new_context(viewport={"width":1600,"height":900},record_video_dir=str(output),record_video_size={"width":1920,"height":1080})
        page=await context.new_page()
        video=page.video
        await page.goto("http://localhost:5173/",wait_until="networkidle")
        await page.evaluate("""() => { const banner=document.createElement('div'); banner.id='demo-step'; Object.assign(banner.style,{position:'fixed',top:'8px',left:'50%',transform:'translateX(-50%)',zIndex:'50',padding:'10px 18px',borderRadius:'6px',fontSize:'15px',background:'#252a1f',color:'#ead8a6',pointerEvents:'none'}); document.body.append(banner); }""")
        async def caption(text):
            await page.locator("#demo-step").evaluate("(element,text)=>element.textContent=text",text)
        async def ask(question,term,status="answered"):
            field=page.get_by_label("Câu hỏi của bạn")
            await field.fill(""); await field.press_sequentially(question,delay=35)
            async with page.expect_response(lambda response:response.url.endswith("/api/chat") and response.request.method=="POST",timeout=90000) as pending:
                await page.get_by_role("button",name="Gửi câu hỏi",exact=True).click()
            response=await pending.value
            assert response.status==200
            payload=await response.json()
            assert payload["status"]==status and term in payload["answer"]
            await expect(page.locator(".chat-message.is-assistant").last).to_contain_text(term)
            results.append({"question":question,"artifact_id":payload["artifact_id"],"status":payload["status"],"elapsed_ms":payload["elapsed_ms"]})
            await asyncio.sleep(2.5)
        await caption("01 · Hỏi tự nhiên về hiện vật đang xem")
        await page.get_by_role("button",name="01 · Trống đồng Ngọc Lũ",exact=True).click()
        await page.get_by_role("button",name="Mở trợ lý AI").click()
        await ask("Trống Ngọc Lũ cao bao nhiêu?","63")
        await caption("Mở nguồn để đối chiếu câu trả lời")
        await page.locator(".chat-message.is-assistant").last.locator("summary").click()
        await asyncio.sleep(3)
        await page.screenshot(path=str(REPOSITORY/"docs"/"screenshots"/"chat-live.png"),full_page=True)
        await caption("02 · Chuyển hiện vật, thay đổi phạm vi tài liệu")
        await page.get_by_role("button",name="02 · Thạp đồng Đào Thịnh",exact=True).click()
        await ask("Cái này có niên đại thế nào?","2.500")
        await caption("Hỏi tiếp trong cùng ngữ cảnh")
        await ask("Còn năm phát hiện thì sao?","1961")
        await caption("03 · Tìm hiểu loại hình dao găm Đông Sơn")
        await page.get_by_role("button",name="03 · Dao găm đồng Đông Sơn",exact=True).click()
        await ask("Lưỡi dao Lạc Việt có hình gì?","lá tre")
        await caption("Thiếu dữ kiện: giải thích giới hạn của mô hình")
        await ask("Dao này dài bao nhiêu?","minh họa","insufficient_evidence")
        await asyncio.sleep(3)
        await context.close()
        source=Path(await video.path())
        destination=output/"chatbot-demo.webm"
        source.replace(destination)
        await browser.close()
    report={"video":"chatbot-demo.webm","resolution":"1920x1080 recording canvas","live_responses":True,"narration":False,"scenes":results}
    (output/"recording.json").write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding="utf-8")
    print(json.dumps(report,ensure_ascii=False,indent=2))


if __name__=="__main__":
    parser=argparse.ArgumentParser();parser.add_argument("--live",action="store_true",required=True);parser.parse_args()
    asyncio.run(main())
