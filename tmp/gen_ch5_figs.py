#!/usr/bin/env python3
"""Generate all updated figures for Chapter 5 sections 5.8 and 5.9."""

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
import os

OUT = '/Users/yingte.dai/thesis/BIT-thesis-LaTex/Image'
os.makedirs(OUT, exist_ok=True)

# ══════════════════════════════════════════════════════════════
#  DATA
# ══════════════════════════════════════════════════════════════

speeds_5 = [3, 5, 7, 9, 12]
speeds_4 = [3, 5, 9, 12]

# --- ViT+Mamba baseline (unchanged) ---
vit = dict(
    cr     = [0.00, 0.77, 2.72, 2.49, 3.01],
    cr_s   = [0.00, 0.90, 2.75, 2.44, 1.64],
    cc     = [0.00, 0.60, 2.10, 2.30, 2.50],
    cc_s   = [0.00, 0.66, 1.76, 1.49, 1.50],
    cpm    = [0.00, 0.01, 0.03, 0.04, 0.04],
    cpm_s  = [0.00, 0.01, 0.03, 0.02, 0.02],
    vx     = [2.56, 3.88, 4.90, 5.58, 7.13],
    vx_s   = [0.01, 0.04, 0.11, 0.27, 0.15],
    jerk   = [0.11, 0.28, 0.55, 0.98, 0.81],
    jerk_s = [0.00, 0.04, 0.22, 0.32, 0.14],
    inf    = [16.34, 14.21, 16.34, 17.36, 17.26],
    inf_s  = [0.84, 1.81, 1.46, 0.27, 0.48],
    sr     = [100, 100, 100, 100, 100],
)

# --- MV+Mamba V_final (updated with new re-run data) ---
mv = dict(
    cr     = [0.00, 0.56, 2.50, 2.13, 1.34],
    cr_s   = [0.00, 0.31, 0.30, 0.52, 0.21],
    cc     = [0.00, 0.27, 2.50, 1.14, 0.91],
    cc_s   = [0.00, 0.03, 0.30, 0.37, 0.30],
    cpm    = [0.00, 0.01, 0.04, 0.02, 0.03],
    cpm_s  = [0.00, 0.00, 0.03, 0.00, 0.00],
    vx     = [2.70, 4.09, 5.25, 6.20, 7.30],
    vx_s   = [0.03, 0.03, 0.08, 0.06, 0.20],
    jerk   = [0.12, 0.05, 0.53, 0.06, 0.24],
    jerk_s = [0.04, 0.01, 0.02, 0.01, 0.26],
    inf    = [20.38, 22.63, 21.44, 22.77, 22.75],
    inf_s  = [0.47, 0.11, 0.20, 0.11, 0.10],
    sr     = [100, 100, 100, 100, 100],
)

# --- V_frozen (MV frozen high-res, before risk distillation) ---
# indices: 3,5,9,12 m/s
vf = dict(
    cr     = [0.50, 1.20, 3.00, 1.90],
    cr_s   = [0.88, 0.31, 0.52, 1.35],
    cc     = [0.20, 0.50, 1.70, 2.36],
    cc_s   = [0.80, 0.41, 0.21, 0.88],
    cpm    = [0.04, 0.03, 0.05, 0.04],
    cpm_s  = [0.01, 0.01, 0.00, 0.02],
    vx     = [2.65, 4.03, 6.17, 7.28],
    vx_s   = [0.05, 0.01, 0.09, 0.15],
    jerk   = [0.17, 0.03, 0.07, 0.27],
    jerk_s = [0.00, 0.00, 0.00, 0.33],
)

# --- V_mid (after high-speed risk distillation, before low-speed fix) ---
vm = dict(
    cr     = [2.68, 4.66, 2.17, 1.34],
    cr_s   = [1.57, 1.97, 0.33, 0.41],
    cc     = [0.84, 1.67, 1.13, 0.94],
    cc_s   = [0.66, 0.97, 0.31, 0.33],
    cpm    = [0.05, 0.09, 0.02, 0.03],
    cpm_s  = [0.05, 0.03, 0.00, 0.01],
    vx     = [2.71, 4.11, 6.24, 7.33],
    vx_s   = [0.06, 0.02, 0.07, 0.26],
    jerk   = [0.11, 0.08, 0.06, 0.28],
    jerk_s = [0.09, 0.02, 0.01, 0.36],
)

# --- V_final at 4 speeds (for progression chart) ---
vfinal_4 = dict(
    cr     = [0.00, 0.56, 2.13, 1.34],
    cr_s   = [0.00, 0.31, 0.52, 0.21],
    cc     = [0.00, 0.27, 1.14, 0.91],
    cc_s   = [0.00, 0.03, 0.37, 0.30],
    vx     = [2.70, 4.09, 6.20, 7.30],
    vx_s   = [0.03, 0.03, 0.06, 0.20],
    jerk   = [0.12, 0.05, 0.06, 0.24],
    jerk_s = [0.04, 0.01, 0.01, 0.26],
)

# --- Trees ViT baseline (unchanged) ---
vit_t = dict(
    cr     = [0.00, 0.95, 2.25, 4.24, 3.30],
    cr_s   = [0.00, 1.16, 1.26, 1.97, 1.39],
    sr     = [100, 100, 100, 100, 100],
)
# --- Trees MV final (unchanged, user didn't provide new Trees data) ---
mv_t = dict(
    cr     = [0.68, 1.47, 0.99, 0.68, 1.04],
    cr_s   = [0.35, 0.56, 0.38, 0.42, 1.01],
    sr     = [100, 100, 100, 100, 100],
)

# ══════════════════════════════════════════════════════════════
#  STYLE
# ══════════════════════════════════════════════════════════════

VIT_C = '#1f77b4'
MV_C  = '#ff7f0e'
VF_C  = '#1f77b4'   # frozen = blue
VM_C  = '#ff7f0e'   # mid = orange
VN_C  = '#2ca02c'   # final = green
FAIL_C = '#d62728'  # fail = red

plt.rcParams.update({
    'font.family': 'sans-serif',
    'font.sans-serif': ['Helvetica Neue', 'Arial', 'DejaVu Sans'],
    'font.size': 11,
    'axes.linewidth': 1.2,
    'axes.grid': True,
    'grid.alpha': 0.3,
    'figure.facecolor': 'white',
    'savefig.facecolor': 'white',
    'savefig.dpi': 200,
    'savefig.bbox': 'tight',
})


def two_line(ax, speeds, d1, d1s, d2, d2s, l1, l2, ylabel,
             c1=VIT_C, c2=MV_C):
    ax.errorbar(speeds, d1, yerr=d1s, fmt='o-', color=c1, lw=2,
                capsize=4, markersize=7, label=l1, zorder=3)
    ax.errorbar(speeds, d2, yerr=d2s, fmt='s--', color=c2, lw=2,
                capsize=4, markersize=7, label=l2, zorder=3)
    ax.set_xlabel('Desired Speed (m/s)', fontsize=12)
    ax.set_ylabel(ylabel, fontsize=12)
    ax.set_xticks(speeds)
    ax.legend(fontsize=10)


def save(fig, name):
    path = os.path.join(OUT, name)
    fig.savefig(path, dpi=200, bbox_inches='tight',
                facecolor='white', edgecolor='none')
    plt.close(fig)
    print(f'  saved: {name}')


L_VIT = 'ViT+Mamba (Baseline)'
L_MV  = 'MambaVision+Mamba (Final)'

# ══════════════════════════════════════════════════════════════
#  FIG 5-8: Spheres Collision Rate
# ══════════════════════════════════════════════════════════════
print('Generating figures...')

fig, ax = plt.subplots(figsize=(8, 5))
two_line(ax, speeds_5, vit['cr'], vit['cr_s'],
         mv['cr'], mv['cr_s'], L_VIT, L_MV,
         'Collision Rate (%)')
ax.set_title('Collision Rate vs Speed (Spheres)', fontsize=13, fontweight='bold')
save(fig, '图5-8_Spheres碰撞率对比.png')

# ══════════════════════════════════════════════════════════════
#  FIG 5-9: Spheres Collision Count
# ══════════════════════════════════════════════════════════════
fig, ax = plt.subplots(figsize=(8, 5))
two_line(ax, speeds_5, vit['cc'], vit['cc_s'],
         mv['cc'], mv['cc_s'], L_VIT, L_MV,
         'Collision Count (events)')
ax.set_title('Collision Count vs Speed (Spheres)', fontsize=13, fontweight='bold')
save(fig, '图5-9_Spheres碰撞次数对比.png')

# ══════════════════════════════════════════════════════════════
#  FIG 5-10: Spheres CPM
# ══════════════════════════════════════════════════════════════
fig, ax = plt.subplots(figsize=(8, 5))
two_line(ax, speeds_5, vit['cpm'], vit['cpm_s'],
         mv['cpm'], mv['cpm_s'], L_VIT, L_MV,
         'Collisions per Meter')
ax.set_title('Collisions per Meter vs Speed (Spheres)', fontsize=13, fontweight='bold')
save(fig, '图5-10_Spheres每米碰撞率对比.png')

# ══════════════════════════════════════════════════════════════
#  FIG 5-11: Spheres Mean Vx
# ══════════════════════════════════════════════════════════════
fig, ax = plt.subplots(figsize=(8, 5))
two_line(ax, speeds_5, vit['vx'], vit['vx_s'],
         mv['vx'], mv['vx_s'], L_VIT, L_MV,
         'Mean V_x (m/s)')
ax.set_title('Mean Flight Speed vs Desired Speed (Spheres)', fontsize=13, fontweight='bold')
save(fig, '图5-11_Spheres平均前向速度对比.png')

# ══════════════════════════════════════════════════════════════
#  FIG 5-12: Success Rate (Spheres + Trees)
# ══════════════════════════════════════════════════════════════
fig, ax = plt.subplots(figsize=(8, 5))
ax.plot(speeds_5, vit['sr'], 'o-', color=VIT_C, lw=2, ms=7,
        label='ViT+Mamba (Spheres)')
ax.plot(speeds_5, vit_t['sr'], '^-', color='#ff7f0e', lw=2, ms=7,
        label='ViT+Mamba (Trees)')
ax.plot(speeds_5, mv['sr'], 's-', color='#2ca02c', lw=2, ms=7,
        label='MambaVision+Mamba (Spheres)')
ax.plot(speeds_5, mv_t['sr'], 'D-', color='#d62728', lw=2, ms=7,
        label='MambaVision+Mamba (Trees)')
ax.set_xlabel('Desired Speed (m/s)', fontsize=12)
ax.set_ylabel('Success Rate (%)', fontsize=12)
ax.set_xticks(speeds_5)
ax.set_ylim(0, 105)
ax.set_title('Success Rate vs Speed', fontsize=13, fontweight='bold')
ax.legend(fontsize=9, loc='lower left')
save(fig, '图5-12_任务成功率对比.png')

# ══════════════════════════════════════════════════════════════
#  FIG 5-13: Spheres Jerk
# ══════════════════════════════════════════════════════════════
fig, ax = plt.subplots(figsize=(8, 5))
two_line(ax, speeds_5, vit['jerk'], vit['jerk_s'],
         mv['jerk'], mv['jerk_s'], L_VIT, L_MV,
         'Jerk (cmd diff norm)')
ax.set_title('Control Jerk vs Speed (Spheres)', fontsize=13, fontweight='bold')
save(fig, '图5-13_Spheres指令Jerk对比.png')

# ══════════════════════════════════════════════════════════════
#  FIG 5-14: Trees Collision Rate
# ══════════════════════════════════════════════════════════════
fig, ax = plt.subplots(figsize=(8, 5))
two_line(ax, speeds_5, vit_t['cr'], vit_t['cr_s'],
         mv_t['cr'], mv_t['cr_s'], L_VIT, L_MV,
         'Collision Rate (%)')
ax.set_title('Collision Rate vs Speed (Trees)', fontsize=13, fontweight='bold')
save(fig, '图5-14_Trees碰撞率对比.png')

# ══════════════════════════════════════════════════════════════
#  FIG 5-15: Inference Latency
# ══════════════════════════════════════════════════════════════
fig, ax = plt.subplots(figsize=(8, 5))
two_line(ax, speeds_5, vit['inf'], vit['inf_s'],
         mv['inf'], mv['inf_s'], L_VIT, L_MV,
         'Inference Time (ms)')
ax.axhline(y=50, color='gray', linestyle=':', alpha=0.7, lw=1.5)
ax.text(11.5, 51, '20 Hz threshold (50ms)', fontsize=8, color='gray',
        ha='right', va='bottom')
ax.set_title('Inference Latency vs Speed (Spheres)\nViT: 60×90, MambaVision: 128×192',
             fontsize=13, fontweight='bold')
save(fig, '图5-15_推理时延对比.png')

# ══════════════════════════════════════════════════════════════
#  NEW FIG: Risk-Set Distillation Progression
#  (V_frozen → V_mid → V_final, for §5.8)
# ══════════════════════════════════════════════════════════════
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(13, 5))

# (a) Collision Rate
for data, label, color, marker, ls in [
    (vf,       'MV-Frozen 128×192',       VF_C, 'o', '-'),
    (vm,       'MV Risk-Distilled (Mid)',  VM_C, 's', '--'),
    (vfinal_4, 'MV+Mamba (Final)',         VN_C, 'D', '-'),
]:
    ax1.errorbar(speeds_4, data['cr'], yerr=data['cr_s'],
                 fmt=f'{marker}{ls}', color=color, lw=2, capsize=4,
                 markersize=7, label=label, zorder=3)

ax1.set_xlabel('Desired Speed (m/s)', fontsize=12)
ax1.set_ylabel('Collision Rate (%)', fontsize=12)
ax1.set_xticks(speeds_4)
ax1.set_title('(a) Collision Rate', fontsize=12, fontweight='bold')
ax1.legend(fontsize=9)

# annotations
ax1.annotate('high-speed\nimproved',
             xy=(9, 2.17), xytext=(10.5, 3.5),
             fontsize=8, color=VM_C, ha='center',
             arrowprops=dict(arrowstyle='->', color=VM_C, lw=1.2))
ax1.annotate('low-speed\ndegraded',
             xy=(5, 4.66), xytext=(6.5, 5.5),
             fontsize=8, color=FAIL_C, ha='center',
             arrowprops=dict(arrowstyle='->', color=FAIL_C, lw=1.2))

# (b) Mean V_x
for data, label, color, marker, ls in [
    (vf,       'MV-Frozen 128×192',       VF_C, 'o', '-'),
    (vm,       'MV Risk-Distilled (Mid)',  VM_C, 's', '--'),
    (vfinal_4, 'MV+Mamba (Final)',         VN_C, 'D', '-'),
]:
    ax2.errorbar(speeds_4, data['vx'], yerr=data['vx_s'],
                 fmt=f'{marker}{ls}', color=color, lw=2, capsize=4,
                 markersize=7, label=label, zorder=3)

# desired speed reference
ax2.plot(speeds_4, speeds_4, ':', color='gray', alpha=0.5, lw=1.5)
ax2.text(11.5, 11.8, 'desired', fontsize=8, color='gray', ha='right')

ax2.set_xlabel('Desired Speed (m/s)', fontsize=12)
ax2.set_ylabel('Mean V_x (m/s)', fontsize=12)
ax2.set_xticks(speeds_4)
ax2.set_title('(b) Mean Forward Speed', fontsize=12, fontweight='bold')
ax2.legend(fontsize=9)

fig.suptitle('Risk-Set Distillation Progression (Spheres)',
             fontsize=14, fontweight='bold', y=1.02)
fig.tight_layout()
save(fig, '图5-17_风险蒸馏迭代进化对比.png')

# ══════════════════════════════════════════════════════════════
#  NEW FIG: "Smoother but More Collisions" failure pattern
#  (V_mid vs V_fail vs V_final at 5 m/s, for §5.9)
# ══════════════════════════════════════════════════════════════
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 5))

versions = ['Mid\n(pre-fix)', 'Failed\n(dmin)', 'Final\n(Ω-event)']
x_pos = np.arange(len(versions))
bar_w = 0.55

# (a) Collision Rate at 5 m/s
cr_vals = [4.66, 5.67, 0.56]
cr_errs = [1.97, 2.33, 0.31]
colors_cr = [VM_C, FAIL_C, VN_C]
bars1 = ax1.bar(x_pos, cr_vals, bar_w, yerr=cr_errs, capsize=5,
                color=colors_cr, edgecolor='#333', linewidth=1.2, alpha=0.85)
ax1.set_ylabel('Collision Rate (%)', fontsize=12)
ax1.set_title('(a) Collision Rate at 5 m/s', fontsize=12, fontweight='bold')
ax1.set_xticks(x_pos)
ax1.set_xticklabels(versions, fontsize=10)
for i, v in enumerate(cr_vals):
    ax1.text(i, v + cr_errs[i] + 0.3, f'{v:.2f}%', ha='center', fontsize=9,
             fontweight='bold')
ax1.annotate('worse', xy=(1, 5.67), xytext=(1.6, 7.5),
             fontsize=9, color=FAIL_C, fontweight='bold',
             arrowprops=dict(arrowstyle='->', color=FAIL_C, lw=1.5))

# (b) Command Jerk at 5 m/s
jk_vals = [0.08, 0.01, 0.05]
jk_errs = [0.02, 0.00, 0.01]
colors_jk = [VM_C, FAIL_C, VN_C]
bars2 = ax2.bar(x_pos, jk_vals, bar_w, yerr=jk_errs, capsize=5,
                color=colors_jk, edgecolor='#333', linewidth=1.2, alpha=0.85)
ax2.set_ylabel('Command Jerk', fontsize=12)
ax2.set_title('(b) Command Jerk at 5 m/s', fontsize=12, fontweight='bold')
ax2.set_xticks(x_pos)
ax2.set_xticklabels(versions, fontsize=10)
for i, v in enumerate(jk_vals):
    ax2.text(i, v + jk_errs[i] + 0.003, f'{v:.2f}', ha='center', fontsize=9,
             fontweight='bold')
ax2.annotate('"smoother"\nbut more collisions', xy=(1, 0.015), xytext=(0.3, 0.065),
             fontsize=9, color=FAIL_C, fontweight='bold',
             arrowprops=dict(arrowstyle='->', color=FAIL_C, lw=1.5))

fig.suptitle('"Smoother but More Collisions" — Low-Speed Fix Failure (5 m/s)',
             fontsize=13, fontweight='bold', y=1.02)
fig.tight_layout()
save(fig, '图5-18_低速补强失败模式对比.png')

print('\nAll figures generated successfully!')
