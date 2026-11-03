"""Extract a PDF for review only. It is not automatically admitted to the RAG index."""
import argparse
from pathlib import Path
from pypdf import PdfReader

if __name__=="__main__":
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument("pdf",type=Path)
    parser.add_argument("--output",type=Path,required=True)
    args=parser.parse_args()
    reader=PdfReader(args.pdf)
    text="\n\n".join(f"## Trang {number}\n{page.extract_text() or ''}" for number,page in enumerate(reader.pages,1))
    args.output.parent.mkdir(parents=True,exist_ok=True)
    args.output.write_text(text,encoding="utf-8")
    print(f"Extracted {len(reader.pages)} pages. Review and assign artifact/source metadata before indexing.")
