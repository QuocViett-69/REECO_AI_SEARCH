from pathlib import Path
import importlib.util
import subprocess
import sys
import os

BASE=Path(__file__).resolve().parent
RUNTIME=Path('C:/Users/ADMIN/.cache/codex-runtimes/codex-primary-runtime')
SKILL=Path('C:/Users/ADMIN/.codex/plugins/cache/openai-primary-runtime/documents/26.1022.11436/skills/documents')
os.environ['PATH']=str(RUNTIME/'dependencies/native/poppler/Library/bin')+os.pathsep+os.environ.get('PATH','')
spec=importlib.util.spec_from_file_location('managed_render_docx',SKILL/'render_docx.py')
renderer=importlib.util.module_from_spec(spec);spec.loader.exec_module(renderer)

# Windows runtime has no bundled LibreOffice. Keep the packaged rasterizer, using
# native Word for its DOCX-to-PDF conversion rather than installing another office suite.
def native_convert(input_path,user_profile,convert_tmp_dir,stem,verbose=False):
    pdf=str(Path(convert_tmp_dir)/(stem+'.pdf'))
    proc=subprocess.run(['powershell.exe','-NoProfile','-ExecutionPolicy','Bypass','-File',str(BASE/'export_word_pdf.ps1'),
        '-InputDocx',str(Path(input_path).resolve()),'-OutputPdf',pdf],capture_output=True,text=True,timeout=240)
    log=proc.stdout+'\n'+proc.stderr
    if verbose:print(log)
    return (pdf if Path(pdf).exists() and Path(pdf).stat().st_size else ''),log

renderer.convert_to_pdf=native_convert
renderer.main()
