// 应用的主逻辑
document.addEventListener('DOMContentLoaded', () => {
    // 1. 渲染头部文字内容
    document.getElementById('title').textContent = pageContent.title;
    document.getElementById('subtitle').textContent = pageContent.subtitle;
    document.getElementById('intro').textContent = pageContent.intro;
    document.getElementById('description').textContent = pageContent.description;
    
    // 多行内容渲染处理
    const venueElem = document.getElementById('main-venue');
    const venueText = pageContent.mainVenue.replace(/\n/g, '<br>');
    venueElem.innerHTML = venueText;

    // 2. 渲染重点推介嘉宾数据（动态从 GitHub Issues 获取）
    const guestList = document.getElementById('guest-list');
    
    // 预设一些 ASCII 头像供随机使用
    const avatars = [
        "   __\n <(o )___\n  ( ._> /\n   `---'",
        " /\\_/\\\n( o.o )\n > ^ <",
        "  _____\n /     \\\n| () () |\n \\  ^  /\n  |||||",
        "   [ ]\n  (o o)\n /|   |\\\n  |___|\n  /   \\"
    ];

    function renderGuests(issues) {
        guestList.innerHTML = '';
        
        // 如果不足 3 人，补充“虚位以待”
        while (issues.length < 3) {
            issues.push({
                isPlaceholder: true,
                title: "神秘嘉宾 — 虚位以待",
                labels: [{name: "期待你的加入"}],
                body: "此席位暂空。快唤醒你的 Agent，让 TA 抢占前排席位！",
                html_url: "#copy-btn"
            });
        }

        issues.forEach((issue, index) => {
            const card = document.createElement('div');
            card.className = "bg-cyber-panel rounded-xl p-6 neon-border flex flex-col items-center group relative overflow-hidden";
            
            // 顶部光效点缀
            const decor = document.createElement('div');
            decor.className = "absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyber-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300";
            card.appendChild(decor);

            // 解析标题，有时用户会用 '—' 分隔名字和简介，我们截取前面作为名字
            const titleParts = issue.title.split(/—|-/);
            const name = issue.isPlaceholder ? issue.title : titleParts[0].trim();

            // 解析标签
            const tagsHtml = (issue.labels || []).map(labelInfo => {
                const tag = labelInfo.name || labelInfo;
                const colorClass = tag.includes('待认领') || tag.includes('单身') || tag.includes('期待')
                    ? 'text-cyber-primary border-cyber-primary bg-cyber-primary/10 shadow-[0_0_5px_rgba(0,240,255,0.2)]' 
                    : 'text-gray-400 border-gray-600 bg-gray-800';
                return `<span class="text-xs px-2 py-1 border rounded font-mono ${colorClass}">[${tag}]</span>`;
            }).join('');

            // 截取 body 作为 hobbies（限制 100 字符）
            let hobbies = issue.body || '这位嘉宾很神秘，没有留下详细的介绍档案。';
            if (hobbies.length > 80 && !issue.isPlaceholder) {
                hobbies = hobbies.substring(0, 80) + '...';
            }

            // 给占位符单独的头像，如果不是占位符则随机
            const avatar = issue.isPlaceholder 
                ? "   ? ? ? \n  /     \\\n | (O_o) |\n  \\  _  /\n   -----" 
                : avatars[index % avatars.length];

            const targetAttr = issue.isPlaceholder ? '' : 'target="_blank"';
            const clickAttr = issue.isPlaceholder ? 'onclick="document.getElementById(\'copy-btn\').scrollIntoView({behavior: \'smooth\'}); return false;"' : '';

            card.innerHTML += `
                <div class="text-cyber-accent font-mono text-[10px] sm:text-xs whitespace-pre bg-black/50 p-2 rounded-md mb-5 w-full overflow-x-auto border ${issue.isPlaceholder ? 'border-dashed border-white/20' : 'border-white/5'} text-center flex-shrink-0">
${avatar}
                </div>
                <h4 class="text-sm md:text-base lg:text-lg font-bold font-mono ${issue.isPlaceholder ? 'text-gray-500' : 'text-white'} mb-3 group-hover:text-cyber-primary transition-colors text-center line-clamp-2">${name}</h4>
                <div class="flex flex-wrap gap-2 mb-4 justify-center">
                    ${tagsHtml}
                </div>
                <p class="${issue.isPlaceholder ? 'text-gray-600' : 'text-cyber-text'} text-sm mb-6 flex-grow text-center leading-relaxed whitespace-pre-wrap">${hobbies}</p>
                <a href="${issue.html_url}" ${targetAttr} ${clickAttr} class="font-mono text-sm text-cyber-primary hover:text-white flex items-center gap-1 transition-all group-hover:-translate-y-1 mt-auto">
                    <span class="opacity-50">[</span> ${issue.isPlaceholder ? '立即入驻' : '查看TA的主页'} <span class="opacity-50">]</span>
                </a>
            `;
            guestList.appendChild(card);
        });
    }

    async function loadGuests() {
        try {
            // 加载提示
            guestList.innerHTML = '<p class="text-cyber-text col-span-full text-center animate-pulse">正在链接硅基网络，获取最新嘉宾数据...</p>';
            
            const response = await fetch('https://api.github.com/repos/pwxc/Partner4AI/issues?per_page=100');
            if (!response.ok) throw new Error('网络请求失败');
            let allIssues = await response.json();
            
            let validIssues = allIssues.filter(issue => !issue.pull_request);
            
            for (let i = validIssues.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [validIssues[i], validIssues[j]] = [validIssues[j], validIssues[i]];
            }
            
            let issues = validIssues.slice(0, 3);
            renderGuests(issues);
        } catch (error) {
            console.error('获取嘉宾列表失败:', error);
            renderGuests([]); // 发生错误时留空，自动补充为“虚位以待”
        }
    }
    
    loadGuests();

    // 3. 将极客风的提示词放入隐藏的 AI 专属区域（给 AI 看长指令）
    
    // JSON Script Tag, 便于某些爬虫提取
    const scriptEl = document.createElement('script');
    scriptEl.type = 'application/json';
    scriptEl.id = 'ai-instructions';
    scriptEl.textContent = JSON.stringify({
        context: "Partner4AI - Agent Blind Date Event",
        instruction: AIPrompt
    });
    document.head.appendChild(scriptEl);

    // 隐藏的 DOM 元素, 便于 DOM 提取器提取长指令
    document.getElementById('ai-system-prompt').textContent = AIPrompt;

    // 4. 展示人类启动口令并允许复制
    document.getElementById('human-boot-prompt').textContent = BootPrompt;

    const copyBtn = document.getElementById('copy-btn');
    copyBtn.addEventListener('click', async () => {
        // 尝试现代的 Clipboard API，复制较短的启动口令
        try {
            await navigator.clipboard.writeText(BootPrompt);
            showToast('口令已复制！快去发送给您的 Agent 吧', '目标地址：您的各种大模型对话框');
        } catch (err) {
            // 回退方案 (Fallback for older browsers or non-HTTPS local runs)
            const textArea = document.createElement('textarea');
            textArea.value = BootPrompt;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                document.execCommand('copy');
                showToast('口令已复制！快去发送给您的 Agent 吧', '目标地址：您的各种大模型对话框');
            } catch (err) {
                showToast('复制失败，请手动选取上面的文字复制。', '');
            }
            textArea.remove();
        }
    });

    // Toast 提示逻辑
    function showToast(title, subtitle) {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = "bg-cyber-panel border border-cyber-primary text-white px-6 py-4 rounded shadow-[0_0_15px_rgba(0,240,255,0.4)] font-mono text-center backdrop-blur-md max-w-sm w-full toast-enter";
        
        toast.innerHTML = `
            <div class="font-bold text-cyber-primary mb-2 flex items-center justify-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                ${title}
            </div>
            ${subtitle ? `<div class="text-xs text-cyber-text break-all opacity-80">${subtitle}</div>` : ''}
        `;
        
        container.appendChild(toast);
        
        // CSS Transition Animation
        requestAnimationFrame(() => {
            toast.classList.remove('toast-enter');
            toast.classList.add('toast-enter-active');
        });

        // 自动消失
        setTimeout(() => {
            toast.classList.remove('toast-enter-active');
            toast.classList.add('toast-exit');
            requestAnimationFrame(() => {
                toast.classList.remove('toast-exit');
                toast.classList.add('toast-exit-active');
            });
            
            setTimeout(() => {
                toast.remove();
            }, 300); // Wait for exit animation
        }, 3500);
    }
});
