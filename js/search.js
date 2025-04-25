// 搜索功能实现
document.addEventListener('DOMContentLoaded', function() {
    // 获取品牌数据并填充下拉框
    fetch('data/cars.json')  // 修正路径，移除前导斜杠
        .then(response => response.json())
        .then(data => {
            // 提取所有不重复的品牌（category）
            const brands = [...new Set(data.cars.map(car => car.category).filter(Boolean))];
            
            // 填充品牌下拉框
            const brandSelect = document.getElementById('brandSelect');
            brands.forEach(brand => {
                const option = document.createElement('option');
                option.value = brand;
                option.textContent = brand;
                brandSelect.appendChild(option);
            });
            
            // 如果当前页面有查询参数，则应用搜索条件
            if (window.location.search) {
                const params = new URLSearchParams(window.location.search);
                
                // 设置表单值
                if (params.has('brand')) {
                    document.getElementById('brandSelect').value = params.get('brand');
                }
                
                if (params.has('age')) {
                    document.getElementById('ageSelect').value = params.get('age');
                }
                
                if (params.has('keyword')) {
                    document.getElementById('searchInput').value = params.get('keyword');
                }
                
                // 如果在首页，立即应用过滤
                if (window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/')) {
                    filterCars(data.cars);
                }
            }
        })
        .catch(error => console.error('加载品牌数据失败:', error));
    
    // 搜索按钮点击事件
    document.getElementById('searchBtn').addEventListener('click', performSearch);
    
    // 回车键搜索
    document.getElementById('searchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    // 执行搜索
    function performSearch() {
        const brand = document.getElementById('brandSelect').value;
        const age = document.getElementById('ageSelect').value;
        const keyword = document.getElementById('searchInput').value.trim().toLowerCase();
        
        // 构建查询参数
        const params = new URLSearchParams();
        if (brand) params.append('brand', brand);
        if (age) params.append('age', age);
        if (keyword) params.append('keyword', keyword);
        
        // 如果当前不在首页，则跳转到首页
        if (!window.location.pathname.endsWith('index.html') && !window.location.pathname.endsWith('/')) {
            window.location.href = `index.html?${params.toString()}`;
        } else {
            // 如果已经在首页，直接应用过滤并更新URL
            window.history.pushState({}, '', `?${params.toString()}`);
            
            // 重新加载并过滤车辆数据
            fetch('data/cars.json')
                .then(response => response.json())
                .then(data => {
                    filterCars(data.cars);
                })
                .catch(error => console.error('加载车辆数据失败:', error));
        }
    }
    
    // 过滤车辆数据并更新显示
    function filterCars(cars) {
        const params = new URLSearchParams(window.location.search);
        let filteredCars = [...cars];
        
        // 品牌过滤
        if (params.has('brand') && params.get('brand')) {
            const brand = params.get('brand');
            filteredCars = filteredCars.filter(car => car.category === brand);
        }
        
        // 车龄过滤
        if (params.has('age') && params.get('age')) {
            const age = parseInt(params.get('age'));
            const currentYear = new Date().getFullYear();
            
            filteredCars = filteredCars.filter(car => {
                // 从car.year中提取年份
                const yearMatch = car.year && car.year.match(/\d{4}/);
                if (yearMatch) {
                    const carYear = parseInt(yearMatch[0]);
                    const carAge = currentYear - carYear;
                    return carAge <= age && carAge > (age - 2); // 车龄在指定范围内
                }
                return false;
            });
        }
        
        // 关键词搜索
        if (params.has('keyword') && params.get('keyword')) {
            const keyword = params.get('keyword').toLowerCase();
            filteredCars = filteredCars.filter(car => {
                return (
                    (car.title && car.title.toLowerCase().includes(keyword)) ||
                    (car.category && car.category.toLowerCase().includes(keyword)) ||
                    (car.description && car.description.toLowerCase().includes(keyword))
                );
            });
        }
        
        // 更新车辆列表显示
        const carListElement = document.querySelector('.car-list:not(.recommend-list)');
        if (carListElement) {
            // 清空现有列表
            carListElement.innerHTML = '';
            
            if (filteredCars.length === 0) {
                // 没有搜索结果
                carListElement.innerHTML = '<div class="no-results">没有找到符合条件的车辆</div>';
                return;
            }
            
            // 添加搜索结果
            filteredCars.forEach(car => {
                const carCard = createCarCard(car);
                carListElement.appendChild(carCard);
            });
        }
    }
    
    // 创建车辆卡片元素
    function createCarCard(car) {
        const carCard = document.createElement('div');
        carCard.className = 'car-card';
        
        // 构建卡片HTML
        carCard.innerHTML = `
            <a href="detail.html?id=${car.id}" class="car-link">
                <div class="car-image">
                    <img src="${car.thumbnail || 'images/placeholder.jpg'}" alt="${car.title || '车辆图片'}">
                </div>
                <div class="car-info">
                    <h3 class="car-title">${car.title || '未知车型'}</h3>
                    <div class="car-price">
                        <span class="current-price">${car.price ? car.price + '万' : '价格面议'}</span>
                    </div>
                    <div class="car-meta">
                        <span>${car.year || ''}</span>
                        <span>${car.mileage || ''}</span>
                    </div>
                    <div class="car-tags">
                        ${car.tags ? car.tags.map(tag => `<span class="car-tag ${tag === '热门' ? 'hot' : ''}">${tag}</span>`).join('') : ''}
                    </div>
                </div>
            </a>
        `;
        
        return carCard;
    }
});