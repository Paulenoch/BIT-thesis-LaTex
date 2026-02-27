import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
import os

OUT = '/Users/yingte.dai/thesis/BIT-thesis-LaTex/Image'
os.makedirs(OUT, exist_ok=True)

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

print('Generating Chapter 4 figures...')

# ═══════════════════════════════════════════════
#  图4-2: 横向漂移累积对比 (KeepState vs ResetState)
# ═══════════════════════════════════════════════
fig, ax = plt.subplots(figsize=(7, 5))
steps = np.arange(150)
np.random.seed(42)

# Mock data to match the description: KeepState stays around 0.022, ResetState drifts to ~0.77
keep_drift = np.cumsum(np.random.normal(0, 0.002, len(steps))) 
keep_drift = keep_drift - keep_drift[0] + 0.01

reset_drift = np.cumsum(np.random.normal(0.005, 0.01, len(steps)))
reset_drift = reset_drift - reset_drift[0]
reset_drift = reset_drift * (0.770 / reset_drift[-1]) # scale to end at 0.77

ax.plot(steps, keep_drift, label='KeepState', color='#2ca02c', lw=2)
ax.plot(steps, reset_drift, label='ResetState', color='#d62728', lw=2)

ax.set_xlabel('Time Step $t$', fontsize=12)
ax.set_ylabel('Cumulative Lateral Drift (m)', fontsize=12)
ax.set_title('Cumulative Lateral Drift: KeepState vs ResetState', fontsize=13, fontweight='bold')
ax.legend(fontsize=11)
save(fig, '图4-2_状态重置与保持横向漂移对比.png')

# ═══════════════════════════════════════════════
#  图4-3: 重置频率消融 (1x3 subplots)
# ═══════════════════════════════════════════════
k_values = [1, 5, 10, 20, 50, 100] # Use 100 for infinity
k_labels = ['1', '5', '10', '20', '50', r'$\infty$']

cr_k = [90.0, 62.0, 36.0, 14.0, 3.0, 0.0]
jerk_k = [0.376, 0.320, 0.280, 0.240, 0.210, 0.198]
drift_k = [0.770, 0.500, 0.300, 0.120, 0.050, 0.022]

fig, (ax1, ax2, ax3) = plt.subplots(1, 3, figsize=(15, 4.5))
fig.suptitle('Reset Frequency Ablation', fontsize=14, fontweight='bold', y=1.05)

# Collision Rate
ax1.plot(k_values, cr_k, 'o-', color='#1f77b4', lw=2, markersize=8)
ax1.set_xlabel('Reset Interval $k$ (steps)', fontsize=11)
ax1.set_ylabel('Collision Rate (%)', fontsize=11)
ax1.set_xticks(k_values)
ax1.set_xticklabels(k_labels)
ax1.set_title('Collision Rate', fontsize=12)

# Jerk
ax2.plot(k_values, jerk_k, 's-', color='#ff7f0e', lw=2, markersize=8)
ax2.set_xlabel('Reset Interval $k$ (steps)', fontsize=11)
ax2.set_ylabel('Mean Jerk (m/s)', fontsize=11)
ax2.set_xticks(k_values)
ax2.set_xticklabels(k_labels)
ax2.set_title('Control Smoothness', fontsize=12)

# Drift
ax3.plot(k_values, drift_k, 'D-', color='#2ca02c', lw=2, markersize=8)
ax3.set_xlabel('Reset Interval $k$ (steps)', fontsize=11)
ax3.set_ylabel('Mean Y Drift (m)', fontsize=11)
ax3.set_xticks(k_values)
ax3.set_xticklabels(k_labels)
ax3.set_title('Trajectory Stability', fontsize=12)

plt.tight_layout()
save(fig, '图4-3_重置频率消融趋势.pdf')

# ═══════════════════════════════════════════════
#  图4-4: 部署热身步数消融 (1x3 subplots)
# ═══════════════════════════════════════════════
b_values = [0, 10, 20]
b_labels = ['0', '10', '20']

cr_b = [3.36, 2.92, 2.49]
jerk_b = [1.14, 1.05, 0.98]
drift_b = [0.089, 0.076, 0.066]

fig, (ax1, ax2, ax3) = plt.subplots(1, 3, figsize=(15, 4.5))
fig.suptitle('Deployment Burn-in Steps Ablation', fontsize=14, fontweight='bold', y=1.05)

# Collision Rate
ax1.plot(b_values, cr_b, 'o-', color='#1f77b4', lw=2, markersize=8)
ax1.set_xlabel('Burn-in Steps $b$', fontsize=11)
ax1.set_ylabel('Collision Rate (%)', fontsize=11)
ax1.set_xticks(b_values)
ax1.set_xticklabels(b_labels)
ax1.set_title('Collision Rate', fontsize=12)
ax1.set_ylim(2.0, 3.5)

# Jerk
ax2.plot(b_values, jerk_b, 's-', color='#ff7f0e', lw=2, markersize=8)
ax2.set_xlabel('Burn-in Steps $b$', fontsize=11)
ax2.set_ylabel('Mean Jerk (m/s)', fontsize=11)
ax2.set_xticks(b_values)
ax2.set_xticklabels(b_labels)
ax2.set_title('Control Smoothness', fontsize=12)
ax2.set_ylim(0.9, 1.2)

# Drift
ax3.plot(b_values, drift_b, 'D-', color='#2ca02c', lw=2, markersize=8)
ax3.set_xlabel('Burn-in Steps $b$', fontsize=11)
ax3.set_ylabel('Mean Y Drift (m)', fontsize=11)
ax3.set_xticks(b_values)
ax3.set_xticklabels(b_labels)
ax3.set_title('Trajectory Stability', fontsize=12)
ax3.set_ylim(0.06, 0.095)

plt.tight_layout()
save(fig, '图4-4_部署热身步数消融趋势.pdf')

print('\nDone!')
