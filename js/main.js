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

// 加载车辆数据
function loadCars() {
    const carListElements = document.querySelectorAll('.car-list');
    if (carListElements.length === 0) return;
    
    // 直接使用内嵌数据
    carListElements.forEach((element, index) => {
        if (index === 0 && !element.classList.contains('recommend-list')) {
            const hotCars = carsData.cars.filter(car => car.tags.includes('热门'));
            renderCars(hotCars, element);
        } else if (index === 1 && !element.classList.contains('recommend-list')) {
            renderCars(carsData.cars, element);
        } else if (element.classList.contains('recommend-list')) {
            renderCars(carsData.recommendCars || [], element);
        }
    });
}

// 渲染车辆列表
function renderCars(cars, container) {
    container.innerHTML = '';
    
    cars.forEach(car => {
        const carElement = document.createElement('div');
        carElement.className = 'car-card';
        carElement.innerHTML = `
            <a href="detail.html?id=${car.id}">
                <div class="car-image">
                    <img src="${car.thumbnail}" alt="${car.title}">
                </div>
                <div class="car-info">
                    <h3 class="car-title">${car.title}</h3>
                    <div class="car-price">
                        <span class="current-price">${car.price}万</span>
                        <span class="original-price">${car.originalPrice}万</span>
                    </div>
                    <div class="car-meta">
                        <span>${car.year}</span>
                        <span>${car.mileage}</span>
                    </div>
                    <div class="car-tags">
                        ${car.tags.map(tag => `<span class="car-tag ${tag === '热门' ? 'hot' : ''}">${tag}</span>`).join('')}
                    </div>
                </div>
            </a>
        `;
        container.appendChild(carElement);
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
    
    // 直接使用内嵌数据
    const car = carsData.cars.find(c => c.id == carId);
    
    if (car) {
        renderCarDetail(car);
        renderRecommendCars(carsData.recommendCars);
    } else {
        console.error('未找到对应ID的车辆:', carId);
    }
}

// 渲染车辆详情
function renderCarDetail(car) {
    // 设置页面标题
    document.title = car.title + ' - 优选汽车';
    
    // 渲染图片画廊
    const galleryMain = document.querySelector('.gallery-main');
    const galleryThumbs = document.querySelector('.gallery-thumbs');
    
    if (galleryMain && galleryThumbs) {
        galleryMain.innerHTML = `<img src="${car.images[0]}" alt="${car.title}">`;
        
        car.images.forEach((image, index) => {
            const thumb = document.createElement('div');
            thumb.className = `gallery-thumb ${index === 0 ? 'active' : ''}`;
            thumb.innerHTML = `<img src="${image}" alt="${car.title} - 图片${index + 1}">`;
            
            thumb.addEventListener('click', () => {
                // 更新主图
                galleryMain.innerHTML = `<img src="${image}" alt="${car.title}">`;
                
                // 更新缩略图激活状态
                document.querySelectorAll('.gallery-thumb').forEach(t => t.classList.remove('active'));
                thumb.classList.add('active');
            });
            
            galleryThumbs.appendChild(thumb);
        });
    }
    
    // 渲染基本信息
    document.querySelector('.detail-title').textContent = car.title;
    document.querySelector('.detail-price').textContent = car.price + '万';
    document.querySelector('.detail-original-price').textContent = car.originalPrice + '万';
    
    // 渲染元数据
    const metaItems = document.querySelectorAll('.meta-item');
    metaItems[0].querySelector('.meta-value').textContent = car.year;
    metaItems[1].querySelector('.meta-value').textContent = car.mileage;
    metaItems[2].querySelector('.meta-value').textContent = car.location;
    
    // 渲染标签
    const tagsContainer = document.querySelector('.detail-tags');
    tagsContainer.innerHTML = '';
    car.tags.forEach(tag => {
        const tagElement = document.createElement('span');
        tagElement.className = `detail-tag ${tag === '热门' ? 'hot' : ''}`;
        tagElement.textContent = tag;
        tagsContainer.appendChild(tagElement);
    });
    
    // 渲染亮点
    const highlightsContainer = document.querySelector('.detail-highlights');
    highlightsContainer.innerHTML = '';
    car.highlights.forEach(highlight => {
        const highlightElement = document.createElement('span');
        highlightElement.className = 'highlight-item';
        highlightElement.textContent = highlight;
        highlightsContainer.appendChild(highlightElement);
    });
    
    // 渲染描述
    document.querySelector('.detail-description').textContent = car.description;
    
    // 渲染参数
    const parametersContainer = document.querySelector('.detail-parameters');
    parametersContainer.innerHTML = '';
    
    for (const [groupName, params] of Object.entries(car.parameters)) {
        const groupElement = document.createElement('div');
        groupElement.className = 'parameter-group';
        
        groupElement.innerHTML = `
            <h3 class="parameter-group-title">${groupName}</h3>
            <div class="parameter-list"></div>
        `;
        
        const paramList = groupElement.querySelector('.parameter-list');
        
        for (const [label, value] of Object.entries(params)) {
            const paramItem = document.createElement('div');
            paramItem.className = 'parameter-item';
            paramItem.innerHTML = `
                <span class="parameter-label">${label}：</span>
                <span class="parameter-value">${value}</span>
            `;
            paramList.appendChild(paramItem);
        }
        
        parametersContainer.appendChild(groupElement);
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
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav-menu');
    
    if (!menuBtn || !navMenu) return;
    
    menuBtn.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });
}

// 搜索功能
function searchCars() {
    const brand = document.getElementById('brand').value;
    const price = document.getElementById('price').value;
    const year = document.getElementById('year').value;
    
    console.log('搜索条件:', { brand, price, year });
    // 实际项目中这里应该发送请求到服务器进行搜索
    // 这里仅作演示
    
    alert('搜索功能已触发，条件：' + JSON.stringify({ brand, price, year }));
    return false; // 阻止表单提交
}

// 在文件顶部添加汽车数据
const carsData = {
  "cars": [
    {
      "id": 1001,
      "title": "奔驰 C级 2019款 C 260 L 运动版",
      "price": 26.80,
      "originalPrice": 38.58,
      "year": "2019年",
      "mileage": "3.2万公里",
      "location": "北京",
      "tags": ["准新车", "原厂质保", "热门"],
      "thumbnail": "images/cars/benz-c.jpg",
      "images": [
        "images/cars/benz-c-1.jpg",
        "images/cars/benz-c-2.jpg",
        "images/cars/benz-c-3.jpg",
        "images/cars/benz-c-4.jpg",
        "images/cars/benz-c-5.jpg"
      ],
      "highlights": ["全景天窗", "真皮座椅", "原厂保养"],
      "parameters": {
        "基本信息": {
          "车型": "三厢轿车",
          "上牌时间": "2019-06",
          "表显里程": "3.2万公里",
          "排量": "1.5T",
          "变速箱": "9挡手自一体",
          "排放标准": "国VI"
        },
        "车辆配置": {
          "座椅材质": "真皮",
          "天窗": "全景天窗",
          "导航": "有",
          "倒车影像": "360°全景",
          "驾驶辅助": "自适应巡航",
          "智能互联": "CarPlay/CarLife"
        },
        "检测信息": {
          "外观检测": "无重大事故",
          "内饰检测": "9成新",
          "发动机检测": "正常",
          "底盘检测": "正常",
          "电气系统": "正常"
        }
      },
      "description": "这是一辆准新车，车况极佳，原厂质保中，全景天窗，真皮座椅，自适应巡航，倒车影像，智能互联等配置一应俱全。"
    },
    {
      "id": 1002,
      "title": "丰田 卡罗拉 2019款 1.2T S-CVT 豪华版",
      "price": 12.58,
      "originalPrice": 15.28,
      "year": "2019年",
      "mileage": "4.5万公里",
      "location": "上海",
      "tags": ["性价比", "省油"],
      "thumbnail": "images/cars/corolla.jpg",
      "images": [
        "images/cars/corolla-1.jpg",
        "images/cars/corolla-2.jpg",
        "images/cars/corolla-3.jpg",
        "images/cars/corolla-4.jpg"
      ],
      "highlights": ["一手车", "定期保养", "省油"],
      "parameters": {
        "基本信息": {
          "车型": "三厢轿车",
          "上牌时间": "2019-08",
          "表显里程": "4.5万公里",
          "排量": "1.2T",
          "变速箱": "CVT无级变速",
          "排放标准": "国VI"
        },
        "车辆配置": {
          "座椅材质": "织物+真皮",
          "天窗": "普通天窗",
          "导航": "有",
          "倒车影像": "有",
          "驾驶辅助": "定速巡航",
          "智能互联": "CarPlay"
        },
        "检测信息": {
          "外观检测": "无重大事故",
          "内饰检测": "8成新",
          "发动机检测": "正常",
          "底盘检测": "正常",
          "电气系统": "正常"
        }
      },
      "description": "丰田卡罗拉是公认的省油耐用车型，这台车为一手车，定期4S店保养，车况良好，适合家用代步。"
    },
    {
      "id": 1003,
      "title": "特斯拉 Model 3 2020款 标准续航后驱升级版",
      "price": 23.99,
      "originalPrice": 29.19,
      "year": "2020年",
      "mileage": "2.8万公里",
      "location": "深圳",
      "tags": ["新能源", "智能", "热门"],
      "thumbnail": "images/cars/tesla-3.jpg",
      "images": [
        "images/cars/tesla-3-1.jpg",
        "images/cars/tesla-3-2.jpg",
        "images/cars/tesla-3-3.jpg",
        "images/cars/tesla-3-4.jpg",
        "images/cars/tesla-3-5.jpg"
      ],
      "highlights": ["自动驾驶", "全玻璃车顶", "OTA升级"],
      "parameters": {
        "基本信息": {
          "车型": "纯电动轿车",
          "上牌时间": "2020-05",
          "表显里程": "2.8万公里",
          "电池容量": "55kWh",
          "电机类型": "永磁同步电机",
          "NEDC续航": "445km"
        },
        "车辆配置": {
          "座椅材质": "纯素皮",
          "天窗": "全玻璃车顶",
          "导航": "有",
          "倒车影像": "有",
          "驾驶辅助": "Autopilot自动辅助驾驶",
          "智能互联": "OTA在线升级"
        },
        "检测信息": {
          "外观检测": "无重大事故",
          "内饰检测": "9成新",
          "电池检测": "健康度95%",
          "底盘检测": "正常",
          "电气系统": "正常"
        }
      },
      "description": "特斯拉Model 3是目前最受欢迎的纯电动车型之一，这台车配置了自动辅助驾驶功能，全玻璃车顶，支持OTA升级，电池健康度高，是一台非常理想的新能源座驾。"
    }
  ],
  "recommendCars": [
    {
      "id": 2001,
      "title": "宝马 3系 2020款 325i M运动套装",
      "price": 29.88,
      "originalPrice": 35.99,
      "year": "2020年",
      "mileage": "2.5万公里",
      "location": "北京",
      "tags": ["豪华", "运动"],
      "thumbnail": "images/cars/bmw-3.jpg"
    },
    {
      "id": 2002,
      "title": "奥迪 A4L 2020款 40 TFSI 时尚动感型",
      "price": 25.68,
      "originalPrice": 32.18,
      "year": "2020年",
      "mileage": "3.1万公里",
      "location": "上海",
      "tags": ["豪华", "舒适"],
      "thumbnail": "images/cars/audi-a4l.jpg"
    },
    {
      "id": 2003,
      "title": "本田 雅阁 2019款 260TURBO 精英版",
      "price": 16.58,
      "originalPrice": 19.98,
      "year": "2019年",
      "mileage": "4.2万公里",
      "location": "广州",
      "tags": ["舒适", "省油"],
      "thumbnail": "images/cars/honda-accord.jpg"
    },
    {
      "id": 2004,
      "title": "大众 途观L 2019款 380TSI 四驱旗舰版",
      "price": 22.38,
      "originalPrice": 27.58,
      "year": "2019年",
      "mileage": "3.8万公里",
      "location": "成都",
      "tags": ["SUV", "四驱"],
      "thumbnail": "images/cars/vw-tiguan.jpg"
    }
  ]
};