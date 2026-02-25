#!/usr/bin/env python3
"""Generate split figures for Chapter 5 sections 5.8 and 5.9 (v2)."""

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
import os

OUT = '/Users/yingte.dai/thesis/BIT-thesis-LaTex/Image'
os.makedirs(OUT, exist_ok=True)

speeds_4 = [3, 5, 9, 12]

VF_C  = '#1f77b4'
VM_C  = '#ff7f0e'
VN_C  = '#2ca02c'
FAIL_C = '#d62728'

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

def save(fig, name):
    path = os.path.join(OUT, name)
    fig.savefig(path, dpi=200, bbox_inches='tight',
                facecolor='white', edgecolor='none')
    plt.close(fig)
    print(f'  saved: {name}')

# ── Data ──
vf = dict(
    cr=[0.50, 1.20, 3.00, 1.90], cr_s=[0.88, 0.31, 0.52, 1.35],
    vx=[2.65, 4.03, 6.17, 7.28], vx_s=[0.05, 0.01, 0.09, 0.15],
)
vm = dict(
    cr=[2.68, 4.66, 2.17, 1.34], cr_s=[1.57, 1.97, 0.33, 0.41],
    vx=[2.71, 4.11, 6.24, 7.33], vx_s=[0.06, 0.02, 0.07, 0.26],
)
vfinal_4 = dict(
    cr=[0.00, 0.56, 2.13, 1.34], cr_s=[0.00, 0.31, 0.52, 0.21],
    vx=[2.70, 4.09, 6.20, 7.30], vx_s=[0.03, 0.03, 0.06, 0.20],
)

series = [
    (vf,       'V_frozen (128x192)',       VF_C, 'o', '-'),
    (vm,       'V_mid (Risk-Distilled)',   VM_C, 's', '--'),
    (vfinal_4, 'V_final (Final)',          VN_C, 'D', '-'),
]

print('Generating split figures...')

# ═══════════════════════════════════════════════
#  图5-17a: Risk-Set Progression — Collision Rate
# ═══════════════════════════════════════════════
fig, ax = plt.subplots(figsize=(8, 5.5))
for data, label, color, marker, ls in series:
    ax.errorbar(speeds_4, data['cr'], yerr=data['cr_s'],
                fmt=f'{marker}{ls}', color=color, lw=2, capsize=5,
                markersize=8, label=label, zorder=3)

ax.annotate('high-speed\nimproved',
            xy=(9, 2.17), xytext=(10.5, 3.8),
            fontsize=9, color=VM_C, ha='center',
            arrowprops=dict(arrowstyle='->', color=VM_C, lw=1.2))
ax.annotate('low-speed\ndegraded',
            xy=(5, 4.66), xytext=(6.5, 6.0),
            fontsize=9, color=FAIL_C, ha='center',
            arrowprops=dict(arrowstyle='->', color=FAIL_C, lw=1.2))

ax.set_xlabel('Desired Speed (m/s)', fontsize=12)
ax.set_ylabel('Collision Rate (%)', fontsize=12)
ax.set_xticks(speeds_4)
ax.set_title('Risk-Set Distillation: Collision Rate Progression',
             fontsize=13, fontweight='bold')
ax.legend(fontsize=10, loc='upper left')
save(fig, '图5-17a_风险蒸馏碰撞率迭代对比.png')

# ═══════════════════════════════════════════════
#  图5-17b: Risk-Set Progression — Mean V_x
# ═══════════════════════════════════════════════
fig, ax = plt.subplots(figsize=(8, 5.5))
for data, label, color, marker, ls in series:
    ax.errorbar(speeds_4, data['vx'], yerr=data['vx_s'],
                fmt=f'{marker}{ls}', color=color, lw=2, capsize=5,
                markersize=8, label=label, zorder=3)

ax.plot(speeds_4, speeds_4, ':', color='gray', alpha=0.5, lw=1.5)
ax.text(11.5, 11.8, 'desired', fontsize=9, color='gray', ha='right')

ax.set_xlabel('Desired Speed (m/s)', fontsize=12)
ax.set_ylabel('Mean V_x (m/s)', fontsize=12)
ax.set_xticks(speeds_4)
ax.set_title('Risk-Set Distillation: Mean Forward Speed Progression',
             fontsize=13, fontweight='bold')
ax.legend(fontsize=10)
save(fig, '图5-17b_风险蒸馏速度效率迭代对比.png')

# ═══════════════════════════════════════════════
#  图5-18a: Low-Speed Failure — Collision Rate
# ═══════════════════════════════════════════════
versions = ['Mid\n(pre-fix)', 'Failed\n(dmin)', 'Final\n(Omega-event)']
x_pos = np.arange(len(versions))
bar_w = 0.55

cr_vals = [4.66, 5.67, 0.56]
cr_errs = [1.97, 2.33, 0.31]
colors_cr = [VM_C, FAIL_C, VN_C]

fig, ax = plt.subplots(figsize=(7, 5.5))
ax.bar(x_pos, cr_vals, bar_w, yerr=cr_errs, capsize=5,
       color=colors_cr, edgecolor='#333', linewidth=1.2, alpha=0.85)
ax.set_ylabel('Collision Rate (%)', fontsize=12)
ax.set_title('"Smoother but More Collisions" (5 m/s)\nCollision Rate',
             fontsize=13, fontweight='bold')
ax.set_xticks(x_pos)
ax.set_xticklabels(versions, fontsize=10)
ax.set_ylim(0, 10)
for i, v in enumerate(cr_vals):
    ax.text(i, v + cr_errs[i] + 0.25, f'{v:.2f}%', ha='center',
            fontsize=10, fontweight='bold')
ax.annotate('worse', xy=(1, 5.67+2.33+0.1), xytext=(1.8, 9.0),
            fontsize=10, color=FAIL_C, fontweight='bold',
            arrowprops=dict(arrowstyle='->', color=FAIL_C, lw=1.5))
save(fig, '图5-18a_低速碰撞率失败对比.png')

# ═══════════════════════════════════════════════
#  图5-18b: Low-Speed Failure — Command Jerk
# ═══════════════════════════════════════════════
jk_vals = [0.08, 0.01, 0.05]
jk_errs = [0.02, 0.00, 0.01]
colors_jk = [VM_C, FAIL_C, VN_C]

fig, ax = plt.subplots(figsize=(7, 5.5))
ax.bar(x_pos, jk_vals, bar_w, yerr=jk_errs, capsize=5,
       color=colors_jk, edgecolor='#333', linewidth=1.2, alpha=0.85)
ax.set_ylabel('Command Jerk', fontsize=12)
ax.set_title('"Smoother but More Collisions" (5 m/s)\nCommand Jerk',
             fontsize=13, fontweight='bold')
ax.set_xticks(x_pos)
ax.set_xticklabels(versions, fontsize=10)
ax.set_ylim(0, 0.13)
for i, v in enumerate(jk_vals):
    ax.text(i, v + jk_errs[i] + 0.003, f'{v:.2f}', ha='center',
            fontsize=10, fontweight='bold')
ax.annotate('"smoother"\nbut more collisions',
            xy=(1, 0.015), xytext=(1.7, 0.085),
            fontsize=10, color=FAIL_C, fontweight='bold',
            arrowprops=dict(arrowstyle='->', color=FAIL_C, lw=1.5))
save(fig, '图5-18b_低速Jerk失败对比.png')

print('\nAll split figures generated successfully!')
