// 主JavaScript文件
document.addEventListener('DOMContentLoaded', function() {
    // 初始化轮播图
    initCarousel();
    
    // 加载车辆数据
    loadCars();
    
    // 如果是详情页，加载详情
    if (document.querySelector('.car-detail')) {
        loadCarDetail();
    }
    
    // 初始化移动端菜单
    initMobileMenu();
    
    // 初始化电话点击功能
    initPhoneClick();
});

// 初始化轮播图
function initCarousel() {
    const carousel = document.querySelector('.carousel');
    if (!carousel) return;
    
    const items = carousel.querySelectorAll('.carousel-item');
    const dots = carousel.querySelectorAll('.carousel-dot');
    let currentIndex = 0;
    
    // 设置第一个为激活状态
    items[0].classList.add('active');
    dots[0].classList.add('active');
    
    // 自动轮播
    setInterval(() => {
        items[currentIndex].classList.remove('active');
        dots[currentIndex].classList.remove('active');
        
        currentIndex = (currentIndex + 1) % items.length;
        
        items[currentIndex].classList.add('active');
        dots[currentIndex].classList.add('active');
    }, 5000);
    
    // 点击指示器切换
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            items[currentIndex].classList.remove('active');
            dots[currentIndex].classList.remove('active');
            
            currentIndex = index;
            
            items[currentIndex].classList.add('active');
            dots[currentIndex].classList.add('active');
        });
    });
}

// 渲染车辆列表
function renderCars(cars, container) {
    container.innerHTML = '';
    
    if (!cars || cars.length === 0) {
        container.innerHTML = '<div class="no-cars">暂无车辆信息</div>';
        return;
    }
    
    cars.forEach(car => {
        // 检查必要字段是否存在
        if (!car.id || !car.thumbnail) {
            console.error('车辆数据缺少必要字段:', car);
            return;
        }
        
        const carElement = document.createElement('div');
        carElement.className = 'car-card';
        
        // 构建HTML，处理可能不存在的字段
        let html = `
            <a href="detail.html?id=${car.id}">
                <div class="car-image">
                    <img src="${car.thumbnail}" alt="${car.title || '汽车'}">
                </div>
                <div class="car-info">`;
        
        if (car.title) {
            html += `<h3 class="car-title">${car.title}</h3>`;
        }
        
        // 价格信息，检查是否存在
        html += `<div class="car-price">`;
        if (car.price) {
            html += `<span class="current-price">${car.price}万</span>`;
        }
        if (car.originalPrice) {
            html += `<span class="original-price">${car.originalPrice}万</span>`;
        }
        html += `</div>`;
        
        // 元数据信息，添加年份和里程的单位，确保排量显示
        html += `<div class="car-meta">`;
        let metaItems = [];
        
        // 年份，添加"年"单位
        if (car.year) metaItems.push(`<span>${car.year}年</span>`);
        
        // 里程，确保带有"万公里"单位
        if (car.mileage) {
            // 检查是否已经包含"万公里"单位
            let mileageText = car.mileage;
            if (!mileageText.includes('万公里')) {
                mileageText += '万公里';
            }
            metaItems.push(`<span>${mileageText}</span>`);
        }
        
        // 排量，确保显示
        if (car.displacement) {
            metaItems.push(`<span>${car.displacement}</span>`);
        } else if (car.parameters && car.parameters['基本信息'] && car.parameters['基本信息']['排量']) {
            // 如果car.displacement不存在，尝试从parameters中获取
            metaItems.push(`<span>${car.parameters['基本信息']['排量']}</span>`);
        }
        
        html += metaItems.join('');
        html += `</div>`;
        
        // 标签信息，检查是否存在
        if (car.tags && car.tags.length > 0) {
            html += `<div class="car-tags">`;
            html += car.tags.map(tag => `<span class="car-tag ${tag === '热门' ? 'hot' : ''}">${tag}</span>`).join('');
            html += `</div>`;
        }
        
        html += `</div></a>`;
        carElement.innerHTML = html;
        container.appendChild(carElement);
    });
}

// 加载车辆数据
function loadCars() {
    const carListElements = document.querySelectorAll('.car-list');
    if (carListElements.length === 0) return;
    
    // 从 cars.json 加载数据，使用绝对路径
    fetch('/data/cars.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('网络响应不正常');
            }
            return response.json();
        })
        .then(data => {
            console.log('成功加载车辆数据:', data);
            
            if (!data.cars || !Array.isArray(data.cars)) {
                console.error('车辆数据格式不正确，缺少cars数组');
                return;
            }
            
            // 初始化分类导航
            initCategoryNav(data.cars);
            
            // 默认显示所有车辆
            carListElements.forEach((element) => {
                if (!element.classList.contains('recommend-list')) {
                    renderCars(data.cars, element);
                } else if (element.classList.contains('recommend-list')) {
                    renderCars(data.recommendCars || [], element);
                }
            });
        })
        .catch(error => {
            console.error('加载车辆数据失败:', error);
            // 在页面上显示错误信息
            carListElements.forEach(element => {
                element.innerHTML = `<div class="error-message">加载车辆数据失败: ${error.message}</div>`;
            });
        });
}

// 初始化分类导航
function initCategoryNav(cars) {
    const categoriesContainer = document.querySelector('.categories');
    if (!categoriesContainer) return;
    
    // 提取所有不重复的分类
    const categories = [...new Set(cars.map(car => car.category))];
    
    // 清空容器
    categoriesContainer.innerHTML = '';
    
    // 添加"全部"分类
    const allCategoryItem = document.createElement('div');
    allCategoryItem.className = 'category-item active';
    allCategoryItem.innerHTML = `
        <div class="category-name">全部</div>
    `;
    allCategoryItem.addEventListener('click', () => {
        // 更新激活状态
        document.querySelectorAll('.category-item').forEach(item => {
            item.classList.remove('active');
        });
        allCategoryItem.classList.add('active');
        
        // 更新页面标题
        const sectionTitle = document.querySelector('.section-title');
        if (sectionTitle) {
            sectionTitle.textContent = '全部车辆';
        }
        
        // 显示所有车辆
        const carList = document.querySelector('.car-list:not(.recommend-list)');
        if (carList) {
            carList.innerHTML = '';
            renderCars(cars, carList);
        }
    });
    categoriesContainer.appendChild(allCategoryItem);
    
    // 添加各个分类
    categories.forEach(category => {
        const categoryItem = document.createElement('div');
        categoryItem.className = 'category-item';
        
        categoryItem.innerHTML = `
            <div class="category-name">${category}</div>
        `;
        
        categoryItem.addEventListener('click', () => {
            // 更新激活状态
            document.querySelectorAll('.category-item').forEach(item => {
                item.classList.remove('active');
            });
            categoryItem.classList.add('active');
            
            // 更新页面标题
            const sectionTitle = document.querySelector('.section-title');
            if (sectionTitle) {
                sectionTitle.textContent = `${category}`;
            }
            
            // 筛选该分类的车辆
            const filteredCars = cars.filter(car => car.category === category);
            
            // 更新车辆列表
            const carList = document.querySelector('.car-list:not(.recommend-list)');
            if (carList) {
                carList.innerHTML = '';
                renderCars(filteredCars, carList);
            }
        });
        
        categoriesContainer.appendChild(categoryItem);
    });
}

// 加载车辆详情
function loadCarDetail() {
    // 获取URL参数中的车辆ID
    const urlParams = new URLSearchParams(window.location.search);
    const carId = urlParams.get('id');
    
    if (!carId) {
        console.error('未找到车辆ID');
        return;
    }
    
    // 从 cars.json 加载数据
    fetch('data/cars.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('网络响应不正常');
            }
            return response.json();
        })
        .then(data => {
            console.log('成功加载车辆数据:', data);
            
            if (!data.cars || !Array.isArray(data.cars)) {
                throw new Error('车辆数据格式不正确，缺少cars数组');
            }
            
            const car = data.cars.find(c => c.id == carId);
            
            if (car) {
                // 确保car对象有所有必要的属性，防止渲染时出错
                car.parameters = car.parameters || {}; // 如果parameters不存在，设置为空对象
                car.tags = car.tags || [];
                car.highlights = car.highlights || [];
                car.images = car.images || [];
                
                renderCarDetail(car);
                
                // 随机推荐4辆车（不包括当前车辆）
                const otherCars = data.cars.filter(c => c.id != carId);
                // 随机打乱数组
                const shuffledCars = shuffleArray(otherCars);
                // 取前4辆车作为推荐
                const randomRecommendCars = shuffledCars.slice(0, 4);
                renderRecommendCars(randomRecommendCars);
            } else {
                console.error('未找到对应ID的车辆:', carId);
                // 显示错误信息
                document.querySelector('.car-detail').innerHTML = '<div class="error-message">未找到该车辆信息</div>';
            }
        })
        .catch(error => {
            console.error('加载车辆数据失败:', error);
            // 显示错误信息
            document.querySelector('.car-detail').innerHTML = `<div class="error-message">加载车辆数据失败: ${error.message}</div>`;
        });
}

// 随机打乱数组的函数
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// 渲染车辆详情
function renderCarDetail(car) {
    // 设置页面标题
    document.title = car.title + ' - 阿敬淘车';
    
    // 渲染图片画廊
    const galleryMain = document.querySelector('.gallery-main');
    const gallerySlider = document.querySelector('.gallery-slider');
    const galleryThumbs = document.querySelector('.gallery-thumbs');
    
    if (galleryMain && galleryThumbs && car.images && car.images.length > 0) {
        // 初始化滑动容器
        if (gallerySlider) {
            gallerySlider.innerHTML = '';
            
            // 添加所有滑动图片
            car.images.forEach((image, index) => {
                const slide = document.createElement('div');
                slide.className = 'gallery-slide';
                slide.innerHTML = `<img src="${image}" alt="${car.title} - 图片${index + 1}">`;
                gallerySlider.appendChild(slide);
            });
        }
        
        // 保留原有的按钮（在移动端通过CSS隐藏）
        const prevButton = document.querySelector('.gallery-prev');
        const nextButton = document.querySelector('.gallery-next');
        
        // 清空缩略图容器
        galleryThumbs.innerHTML = '';
        
        // 添加所有缩略图
        car.images.forEach((image, index) => {
            const thumb = document.createElement('div');
            thumb.className = `gallery-thumb ${index === 0 ? 'active' : ''}`;
            thumb.innerHTML = `<img src="${image}" alt="${car.title} - 图片${index + 1}">`;
            
            thumb.addEventListener('click', () => {
                // 更新滑动位置
                if (gallerySlider) {
                    gallerySlider.style.transition = 'transform 0.3s ease';
                    gallerySlider.style.transform = `translateX(-${index * 100}%)`;
                }
                
                // 更新缩略图激活状态
                document.querySelectorAll('.gallery-thumb').forEach(t => t.classList.remove('active'));
                thumb.classList.add('active');
                
                // 更新当前索引（用于自动轮播）
                currentImageIndex = index;
            });
            
            galleryThumbs.appendChild(thumb);
        });
        
        // 自动轮播图片
        let currentImageIndex = 0;
        const autoSlideInterval = setInterval(() => {
            currentImageIndex = (currentImageIndex + 1) % car.images.length;
            
            // 更新滑动位置
            if (gallerySlider) {
                gallerySlider.style.transition = 'transform 0.3s ease';
                gallerySlider.style.transform = `translateX(-${currentImageIndex * 100}%)`;
            }
            
            // 更新缩略图激活状态
            document.querySelectorAll('.gallery-thumb').forEach((t, i) => {
                if (i === currentImageIndex) {
                    t.classList.add('active');
                } else {
                    t.classList.remove('active');
                }
            });
        }, 3000); // 3秒切换一次
        
        // 添加左右切换按钮事件
        if (prevButton && nextButton) {
            prevButton.addEventListener('click', () => {
                currentImageIndex = (currentImageIndex - 1 + car.images.length) % car.images.length;
                
                // 更新滑动位置
                if (gallerySlider) {
                    gallerySlider.style.transition = 'transform 0.3s ease';
                    gallerySlider.style.transform = `translateX(-${currentImageIndex * 100}%)`;
                }
                
                // 更新缩略图激活状态
                document.querySelectorAll('.gallery-thumb').forEach((t, i) => {
                    if (i === currentImageIndex) {
                        t.classList.add('active');
                    } else {
                        t.classList.remove('active');
                    }
                });
            });
            
            nextButton.addEventListener('click', () => {
                currentImageIndex = (currentImageIndex + 1) % car.images.length;
                
                // 更新滑动位置
                if (gallerySlider) {
                    gallerySlider.style.transition = 'transform 0.3s ease';
                    gallerySlider.style.transform = `translateX(-${currentImageIndex * 100}%)`;
                }
                
                // 更新缩略图激活状态
                document.querySelectorAll('.gallery-thumb').forEach((t, i) => {
                    if (i === currentImageIndex) {
                        t.classList.add('active');
                    } else {
                        t.classList.remove('active');
                    }
                });
            });
        }
        
        // 当用户离开页面时清除定时器
        window.addEventListener('beforeunload', () => {
            clearInterval(autoSlideInterval);
        });
    }
    
    // 更新主图的辅助函数
    function updateMainImage(imageSrc, altText) {
        const mainImage = galleryMain.querySelector('img');
        if (mainImage) {
            mainImage.src = imageSrc;
            mainImage.alt = altText;
        } else {
            const navButtons = galleryMain.innerHTML;
            galleryMain.innerHTML = `<img src="${imageSrc}" alt="${altText}">` + navButtons;
        }
    }
    
    // 渲染基本信息
    document.querySelector('.detail-title').textContent = car.title || '';
    
    // 渲染元数据 - 显示年份、里程和排量
    const metaContainer = document.querySelector('.detail-meta');
    metaContainer.innerHTML = '';
    
    // 年份
    if (car.year) {
        const yearItem = document.createElement('div');
        yearItem.className = 'meta-item';
        yearItem.innerHTML = `
            <span class="meta-icon"><i class="fas fa-calendar-alt"></i></span>
            <span class="meta-value">${car.year}年</span>
        `;
        metaContainer.appendChild(yearItem);
    }
    
    // 里程
    if (car.mileage) {
        const mileageItem = document.createElement('div');
        mileageItem.className = 'meta-item';
        mileageItem.innerHTML = `
            <span class="meta-icon"><i class="fas fa-road"></i></span>
            <span class="meta-value">${car.mileage}</span>
        `;
        metaContainer.appendChild(mileageItem);
    }
    
    // 排量 - 直接使用car.displacement，如果存在的话
    if (car.displacement) {
        const displacementItem = document.createElement('div');
        displacementItem.className = 'meta-item';
        displacementItem.innerHTML = `
            <span class="meta-icon"><i class="fas fa-tachometer-alt"></i></span>
            <span class="meta-value">${car.displacement}</span>
        `;
        metaContainer.appendChild(displacementItem);
    }
    // 如果car.displacement不存在，尝试从parameters中获取
    else if (car.parameters && car.parameters['基本信息'] && car.parameters['基本信息']['排量']) {
        const displacement = car.parameters['基本信息']['排量'];
        const displacementItem = document.createElement('div');
        displacementItem.className = 'meta-item';
        displacementItem.innerHTML = `
            <span class="meta-icon"><i class="fas fa-tachometer-alt"></i></span>
            <span class="meta-value">${displacement}</span>
        `;
        metaContainer.appendChild(displacementItem);
    }
    
    // 渲染标签
    const tagsContainer = document.querySelector('.detail-tags');
    if (tagsContainer && car.tags && Array.isArray(car.tags)) {
        tagsContainer.innerHTML = '';
        car.tags.forEach(tag => {
            const tagElement = document.createElement('span');
            tagElement.className = `detail-tag ${tag === '热门' ? 'hot' : ''}`;
            tagElement.textContent = tag;
            tagsContainer.appendChild(tagElement);
        });
    }
    
    // 渲染亮点
    const highlightsContainer = document.querySelector('.detail-highlights');
    if (highlightsContainer && car.highlights && Array.isArray(car.highlights)) {
        highlightsContainer.innerHTML = '';
        car.highlights.forEach(highlight => {
            const highlightElement = document.createElement('span');
            highlightElement.className = 'highlight-item';
            highlightElement.textContent = highlight;
            highlightsContainer.appendChild(highlightElement);
        });
    }
    
    // 渲染描述
    const descriptionContainer = document.querySelector('.detail-description');
    if (descriptionContainer) {
        descriptionContainer.textContent = car.description || '';
    }
    
    // 渲染参数 - 添加检查确保parameters存在
    const parametersContainer = document.querySelector('.detail-parameters');
    if (parametersContainer && car.parameters) {
        parametersContainer.innerHTML = '';
        
        // 检查parameters是否为对象且不为null
        if (car.parameters && typeof car.parameters === 'object' && car.parameters !== null) {
            for (const [groupName, params] of Object.entries(car.parameters)) {
                const groupElement = document.createElement('div');
                groupElement.className = 'parameter-group';
                
                groupElement.innerHTML = `
                    <h3 class="parameter-group-title">${groupName}</h3>
                    <div class="parameter-list"></div>
                `;
                
                const paramList = groupElement.querySelector('.parameter-list');
                
                // 确保params是对象且不为null
                if (params && typeof params === 'object' && params !== null) {
                    for (const [label, value] of Object.entries(params)) {
                        const paramItem = document.createElement('div');
                        paramItem.className = 'parameter-item';
                        paramItem.innerHTML = `
                            <span class="parameter-label">${label}：</span>
                            <span class="parameter-value">${value}</span>
                        `;
                        paramList.appendChild(paramItem);
                    }
                }
                
                parametersContainer.appendChild(groupElement);
            }
        }
    }
}

// 渲染推荐车型
function renderRecommendCars(cars) {
    const container = document.querySelector('.recommend-list');
    if (!container) return;
    
    renderCars(cars, container);
}

// 初始化移动端菜单
function initMobileMenu() {
    // 移除菜单按钮功能，保持联系电话始终可见
    // 原有代码已注释掉
    /*
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav-menu');
    
    if (!menuBtn || !navMenu) return;
    
    menuBtn.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });
    */
}

// 初始化搜索功能
function initSearch() {
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    
    if (!searchForm || !searchInput) return;
    
    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const searchTerm = searchInput.value.trim().toLowerCase();
        
        if (searchTerm === '') return;
        
        // 如果在详情页，跳转到首页并带上搜索参数
        if (window.location.pathname.includes('detail.html')) {
            window.location.href = `index.html?search=${encodeURIComponent(searchTerm)}`;
            return;
        }
        
        // 在首页直接执行搜索
        performSearch(searchTerm);
    });
    
    // 检查URL中是否有搜索参数
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    
    if (searchParam) {
        searchInput.value = searchParam;
        performSearch(searchParam.toLowerCase());
    }
}

// 执行搜索
function performSearch(searchTerm) {
    // 从 cars.json 加载数据
    fetch('/data/cars.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('网络响应不正常');
            }
            return response.json();
        })
        .then(data => {
            if (!data.cars || !Array.isArray(data.cars)) {
                console.error('车辆数据格式不正确，缺少cars数组');
                return;
            }
            
            // 筛选匹配的车辆
            const filteredCars = data.cars.filter(car => {
                // 匹配标题
                if (car.title && car.title.toLowerCase().includes(searchTerm)) {
                    return true;
                }
                
                // 匹配排量
                if (car.displacement && car.displacement.toLowerCase().includes(searchTerm)) {
                    return true;
                }
                
                // 匹配里程
                if (car.mileage && car.mileage.toLowerCase().includes(searchTerm)) {
                    return true;
                }
                
                return false;
            });
            
            // 更新页面标题
            const sectionTitle = document.querySelector('.section-title');
            if (sectionTitle) {
                sectionTitle.textContent = `搜索结果: ${searchTerm}`;
            }
            
            // 更新车辆列表
            const carList = document.querySelector('.car-list:not(.recommend-list)');
            if (carList) {
                carList.innerHTML = '';
                
                if (filteredCars.length > 0) {
                    renderCars(filteredCars, carList);
                } else {
                    carList.innerHTML = '<div class="no-results">没有找到匹配的车辆，请尝试其他关键词</div>';
                }
            }
        })
        .catch(error => {
            console.error('加载车辆数据失败:', error);
        });
}

// 在页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 初始化搜索功能
    initSearch();
    
    // 其他初始化函数...
    loadCars();
    initMobileMenu();
    
    // 如果是详情页，加载详情
    if (window.location.pathname.includes('detail.html')) {
        loadCarDetail();
    }
});

// 初始化电话点击功能
function initPhoneClick() {
    // 获取所有可能包含电话号码的元素
    const allElements = document.querySelectorAll('a, p, li, span');
    const phonePattern = /联系电话[：:]\s*(\d{11})/;
    
    allElements.forEach(element => {
        if (element.textContent && phonePattern.test(element.textContent)) {
            try {
                const phoneNumber = element.textContent.match(phonePattern)[1];
                
                // 只在移动设备上添加点击事件
                if (window.innerWidth <= 768) {
                    element.addEventListener('click', function(e) {
                        e.preventDefault();
                        showPhoneOptions(phoneNumber);
                    });
                    
                    // 添加样式表明可点击
                    element.style.cursor = 'pointer';
                    if (element.tagName.toLowerCase() === 'a' && 
                        (!element.getAttribute('href') || element.getAttribute('href') === '#')) {
                        element.setAttribute('href', 'javascript:void(0)');
                    }
                }
            } catch (error) {
                console.error('处理电话号码时出错:', error);
            }
        }
    });
}

// 显示电话操作选项
function showPhoneOptions(phoneNumber) {
    // 创建弹出层
    const overlay = document.createElement('div');
    overlay.className = 'phone-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    overlay.style.zIndex = '9999';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    
    // 创建弹出框
    const popup = document.createElement('div');
    popup.className = 'phone-popup';
    popup.style.backgroundColor = '#fff';
    popup.style.borderRadius = '12px';
    popup.style.padding = '20px';
    popup.style.width = '80%';
    popup.style.maxWidth = '300px';
    popup.style.textAlign = 'center';
    popup.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    
    // 添加标题
    const title = document.createElement('h3');
    title.textContent = phoneNumber;
    title.style.margin = '0 0 20px 0';
    title.style.fontSize = '20px';
    title.style.fontWeight = '600';
    title.style.color = '#333';
    
    // 添加按钮容器
    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.flexDirection = 'column';
    buttonContainer.style.gap = '10px';
    
    // 添加拷贝按钮
    const copyButton = document.createElement('button');
    copyButton.textContent = '复制号码';
    copyButton.style.padding = '12px';
    copyButton.style.backgroundColor = '#f5f5f7';
    copyButton.style.border = 'none';
    copyButton.style.borderRadius = '8px';
    copyButton.style.fontSize = '16px';
    copyButton.style.fontWeight = '500';
    copyButton.style.cursor = 'pointer';
    copyButton.style.color = '#333';
    
    copyButton.addEventListener('click', function() {
        navigator.clipboard.writeText(phoneNumber)
            .then(() => {
                copyButton.textContent = '已复制';
                copyButton.style.backgroundColor = '#e0f7e0';
                setTimeout(() => {
                    document.body.removeChild(overlay);
                }, 1000);
            })
            .catch(err => {
                console.error('复制失败:', err);
                copyButton.textContent = '复制失败';
                copyButton.style.backgroundColor = '#f7e0e0';
            });
    });
    
    // 添加呼叫按钮
    const callButton = document.createElement('button');
    callButton.textContent = '拨打电话';
    callButton.style.padding = '12px';
    callButton.style.backgroundColor = 'var(--primary-color, #4a90e2)';
    callButton.style.border = 'none';
    callButton.style.borderRadius = '8px';
    callButton.style.fontSize = '16px';
    callButton.style.fontWeight = '500';
    callButton.style.cursor = 'pointer';
    callButton.style.color = '#fff';
    
    callButton.addEventListener('click', function() {
        window.location.href = `tel:${phoneNumber}`;
        setTimeout(() => {
            document.body.removeChild(overlay);
        }, 1000);
    });
    
    // 添加取消按钮
    const cancelButton = document.createElement('button');
    cancelButton.textContent = '取消';
    cancelButton.style.padding = '12px';
    cancelButton.style.backgroundColor = '#f5f5f7';
    cancelButton.style.border = 'none';
    cancelButton.style.borderRadius = '8px';
    cancelButton.style.fontSize = '16px';
    cancelButton.style.fontWeight = '500';
    cancelButton.style.cursor = 'pointer';
    cancelButton.style.color = '#666';
    cancelButton.style.marginTop = '5px';
    
    cancelButton.addEventListener('click', function() {
        document.body.removeChild(overlay);
    });
    
    // 组装弹出框
    buttonContainer.appendChild(copyButton);
    buttonContainer.appendChild(callButton);
    buttonContainer.appendChild(cancelButton);
    
    popup.appendChild(title);
    popup.appendChild(buttonContainer);
    overlay.appendChild(popup);
    
    // 点击弹出层外部关闭
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
            document.body.removeChild(overlay);
        }
    });
    
    // 添加到页面
    document.body.appendChild(overlay);
}

// 添加一个自定义的contains选择器
if (!Element.prototype.matches) {
    Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
}

if (!NodeList.prototype.forEach) {
    NodeList.prototype.forEach = Array.prototype.forEach;
}

// 在页面大小变化时重新初始化电话点击功能
window.addEventListener('resize', function() {
    initPhoneClick();
});