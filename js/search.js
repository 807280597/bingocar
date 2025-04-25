// 搜索功能实现
document.addEventListener('DOMContentLoaded', function() {
    // 获取品牌数据并填充下拉框
    fetch('/data/cars.json')
        .then(response => response.json())
        .then(data => {
            // 提取所有不重复的品牌（category）
            const brands = [...new Set(data.cars.map(car => car.category))];
            
            // 填充品牌下拉框
            const brandSelect = document.getElementById('brandSelect');
            brands.forEach(brand => {
                if (brand) { // 确保品牌不为空
                    const option = document.createElement('option');
                    option.value = brand;
                    option.textContent = brand;
                    brandSelect.appendChild(option);
                }
            });
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
    
    // 下拉框变化时也执行搜索
    document.getElementById('brandSelect').addEventListener('change', performSearch);
    document.getElementById('ageSelect').addEventListener('change', performSearch);
    
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
        
        // 跳转到首页并带上查询参数
        window.location.href = `index.html?${params.toString()}`;
    }
    
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
    }
});