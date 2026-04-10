# LaTeX 开发环境设置指南

这份指南面向当前仓库 `BIT-thesis-LaTex`，目标是在新电脑上尽快恢复论文写作、绘图和编译流程。

## 1. 克隆仓库

先把仓库拉到本地：

```bash
git clone https://github.com/Paulenoch/BIT-thesis-LaTex.git
cd BIT-thesis-LaTex
```

如果你在新电脑上使用 SSH，也可以改成 SSH 地址再克隆。

## 2. 安装 TeX 发行版

本项目使用 XeLaTeX 编译，推荐优先安装完整发行版。

### macOS

推荐安装 `MacTeX`。安装完成后，下面这些命令应该可用：

```bash
which xelatex
which latexmk
which bibtex
```

当前这台电脑上的参考版本如下：

- `XeTeX 0.999997 (TeX Live 2025)`
- `latexmk 4.86a`

### Windows / Linux

推荐安装 `TeX Live`。

如果不想安装完整 TeX Live，也可以使用 `MiKTeX`，但要确保至少具备：

- `xelatex`
- `latexmk`
- `bibtex`

## 3. 安装编辑器

推荐使用 `VS Code + LaTeX Workshop`，也可以继续使用 TeXstudio、Texmaker 等本地编辑器。

如果你用 VS Code，建议安装：

- `LaTeX Workshop`
- `LTeX` 或同类拼写检查插件（可选）

## 4. 安装 Python 绘图环境

仓库里有若干图表生成脚本，依赖 Python 包。建议在项目根目录创建虚拟环境：

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

当前仓库中的 Python 依赖来自 [requirements.txt](/Users/yingte.dai/thesis/BIT-thesis-LaTex/requirements.txt)：

- `numpy`
- `matplotlib`
- `scipy`
- `seaborn`
- `pandas`
- `pillow`

如果你换到 Windows，激活命令改为：

```powershell
.venv\Scripts\Activate.ps1
```

## 5. 验证基础命令

安装完成后，在项目根目录执行：

```bash
xelatex --version
latexmk -v
python3 --version
```

如果这些命令都能正常输出版本号，说明基础环境已经就绪。

## 6. 编译论文

本项目主入口文件是 [thesis.tex](/Users/yingte.dai/thesis/BIT-thesis-LaTex/thesis.tex)。

推荐的一体化编译命令：

```bash
latexmk -xelatex -interaction=nonstopmode thesis.tex
```

清理中间文件：

```bash
latexmk -c thesis.tex
```

如果你想手动编译，可使用：

```bash
xelatex -no-pdf --interaction=nonstopmode thesis
bibtex thesis
xelatex -no-pdf --interaction=nonstopmode thesis
xelatex --interaction=nonstopmode thesis
```

最终输出通常在项目根目录的 `thesis.pdf`，仓库里也保留了 `out/` 下的部分构建产物。

## 7. 重新生成图表

如果你修改了实验结果或图表脚本，可以按需运行这些脚本：

- [tmp/gen_ch4_figs.py](/Users/yingte.dai/thesis/BIT-thesis-LaTex/tmp/gen_ch4_figs.py)
- [tmp/gen_ch5_figs.py](/Users/yingte.dai/thesis/BIT-thesis-LaTex/tmp/gen_ch5_figs.py)
- [tmp/gen_ch5_figs_v2.py](/Users/yingte.dai/thesis/BIT-thesis-LaTex/tmp/gen_ch5_figs_v2.py)

运行前记得先激活 `.venv`。

## 8. 常用工作流

推荐日常写作流程：

1. `git pull` 同步最新内容
2. `source .venv/bin/activate`
3. 修改 `chapters/`、`reference/`、`Image/` 下内容
4. 执行 `latexmk -xelatex -interaction=nonstopmode thesis.tex`
5. 检查生成的 `thesis.pdf`
6. `git add -A && git commit && git push`

## 9. 常见问题

### 1. 找不到 `xelatex`

说明 TeX 发行版没有装好，或者命令没加入 PATH。macOS 安装 MacTeX 后一般会提供 `/Library/TeX/texbin`。

### 2. 参考文献不更新

先执行一次完整编译流程，或者直接使用 `latexmk -xelatex` 让它自动处理 `bibtex`。

### 3. 图表脚本运行失败

通常是 Python 环境没激活，或者 `requirements.txt` 里的依赖没有安装完整。

### 4. 中文字体或模板异常

当前项目在 [thesis.tex](/Users/yingte.dai/thesis/BIT-thesis-LaTex/thesis.tex) 中使用了 `fontset=fandol`，一般比强依赖系统字体更稳定；如果你换机后仍遇到字体问题，优先检查 TeX 发行版是否完整。

## 10. 建议保留的最小工具集

在新电脑上，至少保证下面这些工具可用：

- Git
- TeX 发行版（MacTeX / TeX Live / MiKTeX）
- `xelatex`
- `latexmk`
- `bibtex`
- Python 3
- VS Code 或你熟悉的 LaTeX 编辑器

如果只是继续写论文，不需要额外安装复杂的系统级依赖。
