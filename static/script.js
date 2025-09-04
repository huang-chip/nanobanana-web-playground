document.addEventListener('DOMContentLoaded', () => {
    const uploadArea = document.querySelector('.upload-area');
    const fileInput = document.getElementById('image-upload');
    const thumbnailsContainer = document.getElementById('thumbnails-container');
    const promptInput = document.getElementById('prompt-input');
    // const apiKeyInput = document.getElementById('api-key-input');
    const generateBtn = document.getElementById('generate-btn');
    const btnText = generateBtn.querySelector('.btn-text');
    const spinner = generateBtn.querySelector('.spinner');
    const resultContainer = document.getElementById('result-image-container');

    let selectedFiles = [];

    // 拖放功能
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        uploadArea.addEventListener(eventName, () => {
            uploadArea.classList.add('drag-over');
        });
    });

    ['dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, () => {
            uploadArea.classList.remove('drag-over');
        });
    });

    uploadArea.addEventListener('drop', (e) => {
        const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
        handleFiles(files);
    });

    fileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files).filter(file => file.type.startsWith('image/'));
        handleFiles(files);
    });

    function handleFiles(files) {
        files.forEach(file => {
            if (!selectedFiles.some(f => f.name === file.name)) {
                selectedFiles.push(file);
                createThumbnail(file);
            }
        });
    }

    function createThumbnail(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const wrapper = document.createElement('div');
            wrapper.className = 'thumbnail-wrapper';
            
            const img = document.createElement('img');
            img.src = e.target.result;
            img.alt = file.name;
            
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-btn';
            removeBtn.innerHTML = '×';
            removeBtn.onclick = () => {
                selectedFiles = selectedFiles.filter(f => f.name !== file.name);
                wrapper.remove();
            };
            
            wrapper.appendChild(img);
            wrapper.appendChild(removeBtn);
            thumbnailsContainer.appendChild(wrapper);
        };
        reader.readAsDataURL(file);
    }

    // --- 核心修改区域开始 ---
    generateBtn.addEventListener('click', async () => {
        // if (!apiKeyInput.value.trim()) {
        //     alert('请输入 OpenRouter API 密钥');
        //     return;
        // }

        // if (selectedFiles.length === 0) {
        //     alert('请选择至少一张图片');
        //     return;
        // }

        if (!promptInput.value.trim()) {
            alert('请输入提示词');
            return;
        }

        setLoading(true);

        try {
            // 1. 创建一个 Promise 数组，用于将所有选中的文件转换为 Base64
            const conversionPromises = selectedFiles.map(file => fileToBase64(file));
            
            // 2. 等待所有文件转换完成
            const base64Images = await Promise.all(conversionPromises);
            
            // 3. 发送包含 images 数组的请求
            const response = await fetch('/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: promptInput.value,
                    images: base64Images, // 注意：这里从 'image' 改为了 'images'，并且值是一个数组
                    // apikey: apiKeyInput.value
                    apikey:null
                })
            });

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            displayResult(data.imageUrl);
        } catch (error) {
            alert('Error: ' + error.message);
            resultContainer.innerHTML = `<p>Error: ${error.message}</p>`;
        } finally {
            setLoading(false);
        }
    });
    // --- 核心修改区域结束 ---

    function setLoading(isLoading) {
        generateBtn.disabled = isLoading;
        btnText.textContent = isLoading ? 'Generating...' : 'Generate';
        spinner.classList.toggle('hidden', !isLoading);
    }

    function fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    function displayResult(imageUrl) {
        resultContainer.innerHTML = '';
        const img = document.createElement('img');
        img.src = imageUrl;
        img.alt = 'Generated image';
        resultContainer.appendChild(img);
    }
});

// 案例库数据 - 精确对应 https://github.com/PicoTrex/Awesome-Nano-Banana-images 的完整47个案例
const showcaseCases = [
    {
        id: 1,
        title: "插画变手办",
        description: "将2D插画转换为3D手办效果",
        category: "object",
        prompt: "将这张照片变成角色手办。在它后面放置一个印有角色图像的盒子，盒子上有一台电脑显示Blender建模过程。在盒子前面添加一个圆形塑料底座，角色手办站在上面。如果可能的话，将场景设置在室内",
        author: "@ZHO_ZHO_ZHO",
        imageRequired: true,
        inputImage: "https://github.com/PicoTrex/Awesome-Nano-Banana-images/raw/main/images/case1/input.jpg",
        outputImage: "https://github.com/PicoTrex/Awesome-Nano-Banana-images/raw/main/images/case1/output.jpg"
    },
    {
        id: 2,
        title: "根据地图箭头生成地面视角图片",
        description: "根据地图上的箭头方向生成对应的地面实景图",
        category: "scene",
        prompt: "画出红色箭头看到的内容 / 从红色圆圈沿箭头方向画出真实世界的视角",
        author: "@tokumin",
        imageRequired: true,
        inputImage: "https://github.com/PicoTrex/Awesome-Nano-Banana-images/raw/main/images/case2/input.jpg",
        outputImage: "https://github.com/PicoTrex/Awesome-Nano-Banana-images/raw/main/images/case2/output.jpg"
    },
    {
        id: 3,
        title: "真实世界的AR信息化",
        description: "为现实场景添加AR风格的信息标签",
        category: "effect",
        prompt: "你是一个基于位置的AR体验生成器。在这张图像中突出显示[兴趣点]并标注相关信息",
        author: "@bilawalsidhu",
        imageRequired: true,
        outputImage: "https://github.com/PicoTrex/Awesome-Nano-Banana-images/raw/main/images/case3/output.jpg"
    },
    {
        id: 4,
        title: "分离出3D建筑/制作等距模型",
        description: "将图像制作成等距视图建筑模型",
        category: "object",
        prompt: "将图像制作成白天和等距视图[仅限建筑]",
        author: "@Zieeett",
        imageRequired: true,
        inputImage: "https://github.com/PicoTrex/Awesome-Nano-Banana-images/raw/main/images/case4/input.jpg",
        outputImage: "https://github.com/PicoTrex/Awesome-Nano-Banana-images/raw/main/images/case4/output.jpg"
    },
    {
        id: 5,
        title: "不同时代自己的照片",
        description: "将人物照片转换为不同历史时代的风格",
        category: "character",
        prompt: "将角色的风格改为[1970]年代的经典[男性]风格，添加[长卷发]，[长胡子]，将背景改为标志性的[加州夏季风景]，不要改变角色的面部",
        author: "@AmirMushich",
        imageRequired: true,
        inputImage: "https://github.com/PicoTrex/Awesome-Nano-Banana-images/raw/main/images/case5/input.jpg",
        outputImage: "https://github.com/PicoTrex/Awesome-Nano-Banana-images/raw/main/images/case5/output.jpg"
    },
    {
        id: 6,
        title: "多参考图像生成",
        description: "基于多个参考图像生成复合场景",
        category: "scene",
        prompt: "一个模特摆姿势靠在粉色宝马车上。她穿着以下物品，场景背景是浅灰色。绿色外星人是一个钥匙扣，挂在粉色手提包上。模特肩上还有一只粉色鹦鹉。旁边坐着一只戴着粉色项圈和金色耳机的哈巴狗",
        author: "@MrDavids1",
        imageRequired: true,
        inputImage: "https://github.com/PicoTrex/Awesome-Nano-Banana-images/raw/main/images/case6/input.jpg",
        outputImage: "https://github.com/PicoTrex/Awesome-Nano-Banana-images/raw/main/images/case6/output.jpg"
    },
    {
        id: 7,
        title: "自动修图",
        description: "自动增强照片的对比度、色彩和光线效果",
        category: "effect",
        prompt: "这张照片很无聊很平淡。增强它！增加对比度，提升色彩，改善光线使其更丰富，你可以裁剪和删除影响构图的细节",
        author: "@op7418",
        imageRequired: true,
        inputImage: "https://github.com/PicoTrex/Awesome-Nano-Banana-images/raw/main/images/case7/input.jpg",
        outputImage: "https://github.com/PicoTrex/Awesome-Nano-Banana-images/raw/main/images/case7/output.jpg"
    },
    {
        id: 8,
        title: "手绘图控制多角色姿态",
        description: "使用手绘草图控制角色的战斗姿势",
        category: "character",
        prompt: "让这两个角色使用图3的姿势进行战斗。添加适当的视觉背景和场景互动，生成图像比例为16:9",
        author: "@op7418",
        imageRequired: true,
        inputImage: "https://github.com/PicoTrex/Awesome-Nano-Banana-images/raw/main/images/case8/input.jpg",
        outputImage: "https://github.com/PicoTrex/Awesome-Nano-Banana-images/raw/main/images/case8/output.jpg"
    },
    {
        id: 9,
        title: "跨视角图像生成",
        description: "将地面视角转换为俯视角度",
        category: "scene",
        prompt: "将照片转换为俯视角度并标记摄影师的位置",
        author: "@op7418",
        imageRequired: true,
        inputImage: "https://github.com/PicoTrex/Awesome-Nano-Banana-images/raw/main/images/case9/input.jpg",
        outputImage: "https://github.com/PicoTrex/Awesome-Nano-Banana-images/raw/main/images/case9/output.jpg"
    },
    {
        id: 10,
        title: "定制人物贴纸",
        description: "将角色转换为白色轮廓贴纸风格",
        category: "style",
        prompt: "帮我将角色变成类似图2的白色轮廓贴纸。角色需要转换成网页插画风格，并添加一个描述图1的俏皮白色轮廓短语",
        author: "@op7418",
        imageRequired: true,
        inputImage: "https://github.com/PicoTrex/Awesome-Nano-Banana-images/raw/main/images/case10/input.jpg",
        outputImage: "https://github.com/PicoTrex/Awesome-Nano-Banana-images/raw/main/images/case10/output.jpg"
    },
    {
        id: 11,
        title: "动漫转真人Coser",
        description: "将动漫角色转换为真人Cosplay照片",
        category: "character",
        prompt: "生成一个女孩cosplay这张插画的照片，背景设置在Comiket",
        author: "@ZHO_ZHO_ZHO",
        imageRequired: true,
        inputImage: "https://github.com/PicoTrex/Awesome-Nano-Banana-images/raw/main/images/case11/input.jpg",
        outputImage: "https://github.com/PicoTrex/Awesome-Nano-Banana-images/raw/main/images/case11/output.jpg"
    },
    {
        id: 12,
        title: "生成角色设定",
        description: "为角色生成完整的设定图（三视图、表情、动作等）",
        category: "character",
        prompt: "为我生成人物的角色设定（Character Design）比例设定（不同身高对比、头身比等）三视图（正面、侧面、背面）表情设定（Expression Sheet）动作设定（Pose Sheet）服装设定（Costume Design）",
        author: "@ZHO_ZHO_ZHO",
        imageRequired: true,
        inputImage: "https://github.com/PicoTrex/Awesome-Nano-Banana-images/raw/main/images/case12/input.jpg",
        outputImage: "https://github.com/PicoTrex/Awesome-Nano-Banana-images/raw/main/images/case12/output.jpg"
    },
    {
        id: 13,
        title: "色卡线稿上色",
        description: "使用指定色卡为线稿图精确上色",
        category: "style",
        prompt: "准确使用图2色卡为图1人物上色",
        author: "@ZHO_ZHO_ZHO",
        imageRequired: true,
        inputImage: "https://github.com/PicoTrex/Awesome-Nano-Banana-images/raw/main/images/case13/input.jpg",
        outputImage: "https://github.com/PicoTrex/Awesome-Nano-Banana-images/raw/main/images/case13/output.jpg"
    },
    {
        id: 14,
        title: "文章信息图",
        description: "为文章内容生成可视化信息图",
        category: "style",
        prompt: "为文章内容生成信息图。要求：1. 将内容翻译成英文，并提炼文章的关键信息 2. 图中内容保持精简，只保留大标题 3. 图中文字采用英文 4. 加上丰富可爱的卡通人物和元素",
        author: "@黄建同学",
        imageRequired: true,
        outputImage: "https://github.com/PicoTrex/Awesome-Nano-Banana-images/raw/main/images/case14/output.jpg"
    },
    {
        id: 15,
        title: "更换多种发型",
        description: "以九宫格方式生成不同发型的头像",
        category: "character",
        prompt: "以九宫格的方式生成这个人不同发型的头像",
        author: "@balconychy",
        imageRequired: true,
        outputImage: "https://github.com/PicoTrex/Awesome-Nano-Banana-images/raw/main/images/case15/output.jpg"
    },
    {
        id: 16,
        title: "模型标注讲解图",
        description: "生成带标注的3D模型讲解图",
        category: "object",
        prompt: "绘制[3D人体器官模型展示示例心脏]用于学术展示，进行标注讲解，适用于展示其原理和[每个器官]的功能，非常逼真，高度还原，精细度非常细致的设计",
        author: "@berryxia_ai",
        imageRequired: false,
        outputImage: "https://github.com/PicoTrex/Awesome-Nano-Banana-images/raw/main/images/case16/output.jpg"
    },
    {
        id: 17,
        title: "定制大理石雕塑",
        description: "将主体转换为精美的大理石雕塑",
        category: "style",
        prompt: "一张超详细的图像中主体雕塑的写实图像，由闪亮的大理石制成。雕塑应展示光滑反光的大理石表面，强调其光泽和艺术工艺。设计优雅，突出大理石的美丽和深度。图像中的光线应增强雕塑的轮廓和纹理，创造出视觉上令人惊叹和迷人的效果",
        author: "@umesh_ai",
        imageRequired: true,
        outputImage: "https://github.com/PicoTrex/Awesome-Nano-Banana-images/raw/main/images/case17/output.jpg"
    },
    {
        id: 18,
        title: "根据食材做菜",
        description: "根据提供的食材制作美味料理",
        category: "object",
        prompt: "用这些食材为我做一顿美味的午餐，放在盘子里，盘子的特写视图，移除其他盘子和食材",
        author: "@Gdgtify",
        imageRequired: true,
        inputImage: "https://github.com/PicoTrex/Awesome-Nano-Banana-images/raw/main/images/case18/input1.jpg",
        outputImage: "https://github.com/PicoTrex/Awesome-Nano-Banana-images/raw/main/images/case18/output1.jpg"
    },
    {
        id: 19,
        title: "数学题推理",
        description: "自动解答数学题并标注答案位置",
        category: "effect",
        prompt: "根据问题将问题的答案写在对应的位置上",
        author: "@Gorden Sun",
        imageRequired: true,
        inputImage: "https://github.com/PicoTrex/Awesome-Nano-Banana-images/raw/main/images/case19/input.jpg",
        outputImage: "https://github.com/PicoTrex/Awesome-Nano-Banana-images/raw/main/images/case19/output.jpg"
    },
    {
        id: 20,
        title: "旧照片上色",
        description: "修复并为黑白老照片上色",
        category: "effect",
        prompt: "修复并为这张照片上色",
        author: "@GeminiApp",
        imageRequired: true,
        inputImage: "https://github.com/PicoTrex/Awesome-Nano-Banana-images/raw/main/images/case20/input.jpg",
        outputImage: "https://github.com/PicoTrex/Awesome-Nano-Banana-images/raw/main/images/case20/output.jpg"
    },
    {
        id: 21,
        title: "OOTD穿搭",
        description: "为人物搭配指定的服装和配饰",
        category: "character",
        prompt: "选择图1中的人，让他们穿上图2中的所有服装和配饰。在户外拍摄一系列写实的OOTD风格照片，使用自然光线，时尚的街头风格，清晰的全身镜头。保持图1中人物的身份和姿势，但以连贯时尚的方式展示图2中的完整服装和配饰",
        author: "@302.AI",
        imageRequired: true,
        inputImage: "https://github.com/PicoTrex/Awesome-Nano-Banana-images/raw/main/images/case21/input.jpg",
        outputImage: "https://github.com/PicoTrex/Awesome-Nano-Banana-images/raw/main/images/case21/output.jpg"
    },
    {
        id: 22,
        title: "人物换衣",
        description: "为人物更换指定的服装",
        category: "character",
        prompt: "将输入图像中人物的服装替换为参考图像中显示的目标服装。保持人物的姿势、面部表情、背景和整体真实感不变。让新服装看起来自然、合身，并与光线和阴影保持一致。不要改变人物的身份或环境——只改变衣服",
        author: "@skirano",
        imageRequired: true,
        inputImage: "https://github.com/PicoTrex/Awesome-Nano-Banana-images/raw/main/images/case22/input.jpg",
        outputImage: "https://github.com/PicoTrex/Awesome-Nano-Banana-images/raw/main/images/case22/output.jpg"
    },
    {
        id: 23,
        title: "多视图结果生成",
        description: "生成物体的六个方向视图",
        category: "object",
        prompt: "在白色背景上生成前、后、左、右、上、下视图。均匀分布。一致的主体。等距透视等效",
        author: "@Error_HTTP_404",
        imageRequired: true,
        inputImage: "https://github.com/PicoTrex/Awesome-Nano-Banana-images/raw/main/images/case23/input.jpg",
        outputImage: "https://github.com/PicoTrex/Awesome-Nano-Banana-images/raw/main/images/case23/output.jpg"
    },
    {
        id: 24,
        title: "电影分镜",
        description: "用角色创作12部分的电影故事分镜",
        category: "scene",
        prompt: "用这两个角色创作一个令人上瘾的12部分故事，包含12张图像，讲述经典的黑色电影侦探故事。故事关于他们寻找线索并最终发现的失落的宝藏。整个故事充满刺激，有情感的高潮和低谷，以精彩的转折和高潮结尾。不要在图像中包含任何文字或文本，纯粹通过图像本身讲述故事",
        author: "@GeminiApp",
        imageRequired: true,
        inputImage: "https://github.com/PicoTrex/Awesome-Nano-Banana-images/raw/main/images/case24/input.jpg",
        outputImage: "https://github.com/PicoTrex/Awesome-Nano-Banana-images/raw/main/images/case24/output.jpg"
    },
    {
        id: 25,
        title: "人物姿势修改",
        description: "调整人物的视线和姿势",
        category: "character",
        prompt: "让图片中的人直视前方",
        author: "@arrakis_ai",
        imageRequired: true,
        inputImage: "https://github.com/PicoTrex/Awesome-Nano-Banana-images/raw/main/images/case25/input.jpg",
        outputImage: "https://github.com/PicoTrex/Awesome-Nano-Banana-images/raw/main/images/case25/output.jpg"
    },
    {
        id: 26,
        title: "线稿图生成图像",
        description: "将人物换成指定姿势并专业摄影",
        category: "character",
        prompt: "将图一人物换成图二姿势，专业摄影棚拍摄",
        author: "@ZHO_ZHO_ZHO",
        imageRequired: true,
        inputImage: "https://github.com/PicoTrex/Awesome-Nano-Banana-images/raw/main/images/case26/input.jpg",
        outputImage: "https://github.com/PicoTrex/Awesome-Nano-Banana-images/raw/main/images/case26/output.jpg"
    },
    {
        id: 27,
        title: "为图像添加水印",
        description: "在图片上反复覆盖指定文字水印",
        category: "effect",
        prompt: "在整个图片上反复覆盖\"TRUMP\"这个词。",
        author: "@AiMachete",
        imageRequired: true,
        inputImage: "https://github.com/PicoTrex/Awesome-Nano-Banana-images/raw/main/images/case27/input.jpg",
        outputImage: "https://github.com/PicoTrex/Awesome-Nano-Banana-images/raw/main/images/case27/output.jpg"
    },
    {
        id: 28,
        title: "知识推理生成图像",
        description: "生成知识性的信息图表",
        category: "style",
        prompt: "为我制作一张世界五座最高建筑的信息图 / 制作一张关于地球上最甜蜜事物的彩色信息图",
        author: "@icreatelife",
        imageRequired: false,
        outputImage: "https://github.com/PicoTrex/Awesome-Nano-Banana-images/raw/main/images/case28/output.jpg"
    },
    {
        id: 29,
        title: "红笔批注",
        description: "分析图片并用红笔标出改进建议",
        category: "effect",
        prompt: "分析这张图片。用红笔标出你可以改进的地方。",
        author: "@AiMachete",
        imageRequired: true,
        inputImage: "https://github.com/PicoTrex/Awesome-Nano-Banana-images/raw/main/images/case29/input.jpg",
        outputImage: "https://github.com/PicoTrex/Awesome-Nano-Banana-images/raw/main/images/case29/output.jpg"
    },
    {
        id: 30,
        title: "爆炸的食物",
        description: "创建产品的爆炸式动态广告效果",
        category: "effect",
        prompt: "在具有戏剧性的现代场景中拍摄该产品，并伴随着爆炸性的向外动态排列，主要成分新鲜和原始在产品周围飞舞，表明其新鲜度和营养价值。促销广告镜头，没有文字，强调产品，以关键品牌颜色作为背景。",
        author: "@icreatelife",
        imageRequired: true,
        outputImage: "https://github.com/PicoTrex/Awesome-Nano-Banana-images/raw/main/images/case30/output.jpg"
    },
    {
        id: 31,
        title: "制作漫画书",
        description: "基于图像制作奇幻漫画书条幅",
        category: "style",
        prompt: "基于上传的图像，制作漫画书条幅，添加文字，写一个引人入胜的故事。我想要一本奇幻漫画书。",
        author: "@icreatelife",
        imageRequired: true,
        inputImage: "https://github.com/PicoTrex/Awesome-Nano-Banana-images/raw/main/images/case31/input.jpg",
        outputImage: "https://github.com/PicoTrex/Awesome-Nano-Banana-images/raw/main/images/case31/output.jpg"
    },
    {
        id: 32,
        title: "动作人偶",
        description: "制作定制的动作人偶包装",
        category: "object",
        prompt: "制作一个写着 [\"AI Evangelist - Kris\"] 的动作人偶，并包含 [咖啡、乌龟、笔记本电脑、手机和耳机] 。",
        author: "@icreatelife",
        imageRequired: true,
        inputImage: "https://github.com/PicoTrex/Awesome-Nano-Banana-images/raw/main/images/case32/input.jpg",
        outputImage: "https://github.com/PicoTrex/Awesome-Nano-Banana-images/raw/main/images/case32/output.jpg"
    },
    {
        id: 33,
        title: "地图生成等距建筑",
        description: "将地图位置转换为游戏风格的等距建筑",
        category: "scene",
        prompt: "以这个位置为地标，将其设为等距图像（仅建筑物），采用游戏主题公园的风格",
        author: "@demishassabis",
        imageRequired: true,
        inputImage: "https://github.com/PicoTrex/Awesome-Nano-Banana-images/raw/main/images/case33/input.jpg",
        outputImage: "https://github.com/PicoTrex/Awesome-Nano-Banana-images/raw/main/images/case33/output.jpg"
    },
    {
        id: 34,
        title: "参考图控制人物表情",
        description: "使用参考图控制人物的面部表情",
        category: "character",
        prompt: "图一人物参考/换成图二人物的表情",
        author: "@ZHO_ZHO_ZHO",
        imageRequired: true,
        outputImage: "https://github.com/PicoTrex/Awesome-Nano-Banana-images/raw/main/images/case34/case.jpg"
    },
    {
        id: 35,
        title: "插画绘画过程四格",
        description: "展示插画的四步绘画过程",
        category: "style",
        prompt: "为人物生成绘画过程四宫格，第一步：线稿，第二步平铺颜色，第三步：增加阴影，第四步：细化成型。不要文字",
        author: "@ZHO_ZHO_ZHO",
        imageRequired: true,
        outputImage: "https://github.com/PicoTrex/Awesome-Nano-Banana-images/raw/main/images/case35/case.jpg"
    },
    {
        id: 36,
        title: "虚拟试妆",
        description: "为人物试用指定的妆容效果",
        category: "character",
        prompt: "为图一人物化上图二的妆，还保持图一的姿势",
        author: "@ZHO_ZHO_ZHO",
        imageRequired: true,
        outputImage: "https://github.com/PicoTrex/Awesome-Nano-Banana-images/raw/main/images/case36/case.jpg"
    },
    {
        id: 37,
        title: "妆面分析",
        description: "分析妆容并用红笔标出改进建议",
        category: "effect",
        prompt: "分析这张图片。用红笔标出可以改进的地方 Analyze this image. Use red pen to denote where you can improve",
        author: "@ZHO_ZHO_ZHO",
        imageRequired: true,
        inputImage: "https://github.com/PicoTrex/Awesome-Nano-Banana-images/raw/main/images/case37/input.jpg",
        outputImage: "https://github.com/PicoTrex/Awesome-Nano-Banana-images/raw/main/images/case37/output.jpg"
    },
    {
        id: 38,
        title: "Google地图视角下的中土世界",
        description: "模拟行车记录仪或街景拍摄效果",
        category: "scene",
        prompt: "行车记录仪谷歌街景拍摄 | [霍比屯街道] | [霍比特人进行园艺和抽烟斗等日常活动] | [晴天]",
        author: "@TechHallo",
        imageRequired: false,
        outputImage: "https://github.com/PicoTrex/Awesome-Nano-Banana-images/raw/main/images/case38/output.jpg"
    },
    {
        id: 39,
        title: "印刷插画生成",
        description: "使用文字字母创作极简主义插画",
        category: "style",
        prompt: "仅使用短语 [\"riding a bike\"] 中的字母，创作一幅极简主义的黑白印刷插图，描绘骑自行车的场景。每个字母的形状和位置都应富有创意，以构成骑车人、自行车和动感。设计应简洁、极简，完全由修改后的 [\"riding a bike\"] 字母组成，不添加任何额外的形状或线条。字母应流畅或弯曲，以模仿场景的自然形态，同时保持清晰易读。",
        author: "@Umesh",
        imageRequired: false,
        outputImage: "https://github.com/PicoTrex/Awesome-Nano-Banana-images/raw/main/images/case39/output.jpg"
    },
    {
        id: 40,
        title: "超多人物姿势生成",
        description: "为角色创建多种不同姿势的参考表",
        category: "character",
        prompt: "请为这幅插图创建一个姿势表，摆出各种姿势",
        author: "@tapehead_Lab",
        imageRequired: true,
        outputImage: "https://github.com/PicoTrex/Awesome-Nano-Banana-images/raw/main/images/case40/case.jpg"
    },
    {
        id: 41,
        title: "物品包装生成",
        description: "将物品设计成产品包装效果",
        category: "object",
        prompt: "把图一贴在图二易拉罐上，并放在极简设计的布景中，专业摄影",
        author: "@ZHO_ZHO_ZHO",
        imageRequired: true,
        outputImage: "https://github.com/PicoTrex/Awesome-Nano-Banana-images/raw/main/images/case41/case.jpg"
    },
    {
        id: 42,
        title: "叠加滤镜/材质",
        description: "为照片叠加特殊滤镜或材质效果",
        category: "effect",
        prompt: "为图一照片叠加上图二 [玻璃] 的效果",
        author: "@ZHO_ZHO_ZHO",
        imageRequired: true,
        outputImage: "https://github.com/PicoTrex/Awesome-Nano-Banana-images/raw/main/images/case42/case.jpg"
    },
    {
        id: 43,
        title: "控制人物脸型",
        description: "调整人物的脸型特征",
        category: "character",
        prompt: "图一人物按照图二的脸型设计为q版形象",
        author: "@ZHO_ZHO_ZHO",
        imageRequired: true,
        outputImage: "https://github.com/PicoTrex/Awesome-Nano-Banana-images/raw/main/images/case43/case.jpg"
    },
    {
        id: 44,
        title: "光影控制",
        description: "精确控制图片的光影效果",
        category: "effect",
        prompt: "图一人物变成图二光影，深色为暗",
        author: "@ZHO_ZHO_ZHO",
        imageRequired: true,
        outputImage: "https://github.com/PicoTrex/Awesome-Nano-Banana-images/raw/main/images/case44/case.jpg"
    },
    {
        id: 45,
        title: "乐高玩具小人",
        description: "将人物转换为乐高小人包装盒风格",
        category: "object",
        prompt: "将照片中的人物转化为乐高小人包装盒的风格，以等距透视呈现。在包装盒上标注标题\"ZHOGUE\"。在盒内展示基于照片中人物的乐高小人，并配有他们必需的物品（如化妆品、包或其他物品）作为乐高配件。在盒子旁边，也展示实际乐高小人本身，未包装，以逼真且生动的方式渲染。",
        author: "@ZHO_ZHO_ZHO",
        imageRequired: true,
        inputImage: "https://github.com/PicoTrex/Awesome-Nano-Banana-images/raw/main/images/case45/input.jpg",
        outputImage: "https://github.com/PicoTrex/Awesome-Nano-Banana-images/raw/main/images/case45/output.jpg"
    },
    {
        id: 46,
        title: "高达模型小人",
        description: "将人物转换为高达模型套件风格",
        category: "object",
        prompt: "将照片中的人物转化为高达模型套件包装盒的风格，以等距透视呈现。在包装盒上标注标题\"ZHOGUE\"。在盒内展示照片中人物的高达风格机械人版本，并伴随其必需品（如化妆品、包袋或其他物品）重新设计为未来派机械配件。包装盒应类似真实的 Gunpla 盒子，包含技术插图、说明书风格细节和科幻字体。在盒子旁边，也展示实际的高达风格机械人本身，在包装外以逼真且栩栩如生的风格渲染，类似于官方 Bandai 宣传渲染图。",
        author: "@ZHO_ZHO_ZHO",
        imageRequired: true,
        inputImage: "https://github.com/PicoTrex/Awesome-Nano-Banana-images/raw/main/images/case46/input.jpg",
        outputImage: "https://github.com/PicoTrex/Awesome-Nano-Banana-images/raw/main/images/case46/output.jpg"
    },
    {
        id: 47,
        title: "硬件拆解图",
        description: "生成设备的分解组装图",
        category: "object",
        prompt: "数码单反相机的分解图，展示了其所有配件和内部组件，例如镜头、滤镜、内部组件、镜头、传感器、螺丝、按钮、取景器、外壳和电路板。保留了数码单反相机的红色装饰。",
        author: "@AIimagined",
        imageRequired: false,
        outputImage: "https://github.com/PicoTrex/Awesome-Nano-Banana-images/raw/main/images/case47/output.jpg"
    }
];

// 案例展示功能
document.addEventListener('DOMContentLoaded', () => {
    const showcaseBtn = document.getElementById('showcase-btn');
    const showcaseModal = document.getElementById('showcase-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const casesGrid = document.getElementById('cases-grid');
    const caseSearch = document.getElementById('case-search');
    const filterTags = document.querySelectorAll('.filter-tag');
    const promptInput = document.getElementById('prompt-input');
    
    let filteredCases = [...showcaseCases];
    let selectedCase = null;
    
    // 打开弹窗
    showcaseBtn.addEventListener('click', () => {
        showcaseModal.classList.remove('hidden');
        renderCases(filteredCases);
    });
    
    // 关闭弹窗
    closeModalBtn.addEventListener('click', closeModal);
    showcaseModal.addEventListener('click', (e) => {
        if (e.target === showcaseModal) {
            closeModal();
        }
    });
    
    function closeModal() {
        showcaseModal.classList.add('hidden');
        selectedCase = null;
        document.querySelectorAll('.case-card').forEach(card => {
            card.classList.remove('selected');
        });
    }
    
    // 搜索功能
    caseSearch.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const activeCategory = document.querySelector('.filter-tag.active').dataset.category;
        
        filteredCases = showcaseCases.filter(case_ => {
            const matchesSearch = case_.title.toLowerCase().includes(searchTerm) ||
                                case_.description.toLowerCase().includes(searchTerm) ||
                                case_.prompt.toLowerCase().includes(searchTerm);
            const matchesCategory = activeCategory === 'all' || case_.category === activeCategory;
            
            return matchesSearch && matchesCategory;
        });
        
        renderCases(filteredCases);
    });
    
    // 分类筛选
    filterTags.forEach(tag => {
        tag.addEventListener('click', () => {
            filterTags.forEach(t => t.classList.remove('active'));
            tag.classList.add('active');
            
            const category = tag.dataset.category;
            const searchTerm = caseSearch.value.toLowerCase();
            
            filteredCases = showcaseCases.filter(case_ => {
                const matchesSearch = case_.title.toLowerCase().includes(searchTerm) ||
                                    case_.description.toLowerCase().includes(searchTerm) ||
                                    case_.prompt.toLowerCase().includes(searchTerm);
                const matchesCategory = category === 'all' || case_.category === category;
                
                return matchesSearch && matchesCategory;
            });
            
            renderCases(filteredCases);
        });
    });
    
    // 渲染案例
    function renderCases(cases) {
        casesGrid.innerHTML = '';
        
        if (cases.length === 0) {
            casesGrid.innerHTML = '<p style="text-align: center; color: #888; grid-column: 1 / -1;">未找到匹配的案例</p>';
            return;
        }
        
        cases.forEach(case_ => {
            const caseCard = document.createElement('div');
            caseCard.className = 'case-card';
            caseCard.dataset.caseId = case_.id;
            
            // 构建图片展示部分
            let imageSection = '';
            if (case_.inputImage && case_.outputImage) {
                imageSection = `
                    <div class="case-images-table">
                        <div class="image-row">
                            <div class="image-cell">
                                <div class="image-label">输入</div>
                                <img src="${case_.inputImage}" alt="输入图片" onerror="this.parentElement.innerHTML='<div class=\\"image-placeholder\\">📷 输入图片</div>
                            </div>
                            <div class="image-cell">
                                <div class="image-label">输出</div>
                                <img src="${case_.outputImage}" alt="输出图片" onerror="this.parentElement.innerHTML='<div class=\\"image-placeholder\\">🖼️ 输出图片</div>
                            </div>
                        </div>
                    </div>
                `;
            } else if (case_.outputImage) {
                imageSection = `
                    <div class="case-images-table">
                        <div class="image-row single">
                            <div class="image-cell">
                                <div class="image-label">输出效果</div>
                                <img src="${case_.outputImage}" alt="输出图片" onerror="this.parentElement.innerHTML='<div class=\\"image-placeholder\\">🖼️ 效果预览</div>
                            </div>
                        </div>
                    </div>
                `;
            } else {
                imageSection = `
                    <div class="case-image placeholder">
                        <span>🖼️ 效果预览</span>
                    </div>
                `;
            }
            
            caseCard.innerHTML = `
                ${imageSection}
                <div class="case-info">
                    <div class="case-title">${case_.title}</div>
                    <div style="display:flex;justify-content:space-between;">
                        <div class="case-description">${case_.description}</div>
                        <div class="case-category">${getCategoryName(case_.category)}</div>
                    </div>
                    <div class="case-prompt-full">
                        <div class="prompt-label">提示词：</div>
                        <div class="prompt-text">${case_.prompt}</div>
                    </div>
                </div>
            `;
            // <div class="case-meta">
            //     ${case_.imageRequired ? '📷 需要上传图片' : '📝 仅需文本'} • ${case_.author}
            // </div>
            
            caseCard.addEventListener('click', () => {
                // 移除之前的选中状态
                document.querySelectorAll('.case-card').forEach(card => {
                    card.classList.remove('selected');
                });
                
                // 选中当前卡片
                caseCard.classList.add('selected');
                selectedCase = case_;
                
                // 填充prompt
                promptInput.value = case_.prompt;
                
                // 关闭弹窗
                setTimeout(() => {
                    closeModal();
                }, 500);
                
                // 显示提示信息
                if (case_.imageRequired) {
                    showNotification('✅ 提示词已填充！请上传相应的图片。');
                } else {
                    showNotification('✅ 提示词已填充！可以直接生成图片。');
                }
            });
            
            casesGrid.appendChild(caseCard);
        });
    }
    
    function getCategoryName(category) {
        const categoryNames = {
            'character': '人物角色',
            'style': '风格转换',
            'scene': '场景生成',
            'object': '物品设计',
            'effect': '特效处理'
        };
        return categoryNames[category] || category;
    }
    
    function showNotification(message) {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #22c55e;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
            z-index: 1001;
            font-weight: 500;
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // 3秒后自动移除
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    // 添加动画样式
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
});
