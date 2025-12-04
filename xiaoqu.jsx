// 从全局变量获取数据，data.js文件会定义window.SZ_HOUSING_DATA
const getHousingData = () => {
  return window.SZ_HOUSING_DATA || {};
};

function ShenzhenHousingApp() {
  // 1. 状态管理
  const [selectedDistrict, setSelectedDistrict] = useState("罗湖区"); // 默认选中罗湖
  const [selectedPianqu, setSelectedPianqu] = useState("");         // 选中的片区
  const [searchText, setSearchText] = useState("");                 // 搜索关键词
  const [searchFocused, setSearchFocused] = useState(false);        // 搜索框聚焦状态

  // 获取所有行政区列表
  const districts = Object.keys(getHousingData());

  // 2. 核心逻辑：获取当前展示的小区列表
  const displayList = useMemo(() => {
    const districtData = getHousingData()[selectedDistrict] || [];
    
    // 场景 A: 搜索模式 (优先级最高)
    // 只有当输入超过 1 个字符时才触发，防止输入一个字就跳出太多无关结果
    if (searchText.trim().length >= 1) {
      const keyword = searchText.trim().toLowerCase();
      let results = [];
      
      // 遍历该区下所有片区
      districtData.forEach(pianqu => {
        // 过滤符合关键词的小区
        const matchedEstates = pianqu.estates.filter(estate => 
          estate.toLowerCase().includes(keyword)
        );
        
        // 将匹配结果格式化
        matchedEstates.forEach(estate => {
          results.push({
            estateName: estate,
            pianquName: pianqu.name,
            matchType: 'search'
          });
        });
      });
      return results;
    }
    
    // 场景 B: 片区筛选模式
    if (selectedPianqu) {
      const targetPianqu = districtData.find(p => p.name === selectedPianqu);
      if (targetPianqu) {
        return targetPianqu.estates.map(estate => ({
          estateName: estate,
          pianquName: targetPianqu.name,
          matchType: 'filter'
        }));
      }
    }
    
    // 默认状态：不展示列表，或者展示空状态提示用户操作
    return [];
  }, [selectedDistrict, selectedPianqu, searchText]);

  // 3. 交互处理
  // 切换行政区时，重置下级筛选
  const handleDistrictChange = (district) => {
    setSelectedDistrict(district);
    setSelectedPianqu("");
    setSearchText("");
  };

  // 选择片区时，清空搜索框 (互斥)
  const handlePianquChange = (e) => {
    setSelectedPianqu(e.target.value);
    setSearchText(""); 
  };

  // 输入搜索时，清空片区选择 (互斥)
  const handleSearchInput = (e) => {
    const val = e.target.value;
    setSearchText(val);
    if (val.length > 0) {
      setSelectedPianqu("");
    }
  };

  const clearSearch = () => {
    setSearchText("");
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans pb-10">
      {/* 顶部 Header */}
      <div className="bg-blue-600 text-white p-4 shadow-md sticky top-0 z-20">
        <h1 className="text-lg font-bold flex items-center gap-2">
          <Building2 size={20} />
          深圳小区查询助手
        </h1>
        <p className="text-blue-100 text-xs mt-1">数据更新：2023年11月</p>
      </div>

      {/* 一级筛选：行政区 Tab */}
      <div className="bg-white shadow-sm sticky top-[76px] z-10 overflow-x-auto no-scrollbar">
        <div className="flex px-2 py-2 gap-2 min-w-max">
          {districts.map(district => (
            <button
              key={district}
              onClick={() => handleDistrictChange(district)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedDistrict === district
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {district}
            </button>
          ))}
        </div>
      </div>

      {/* 主操作区 */}
      <div className="p-4 space-y-4">
        
        {/* 当前选中区域提示 */}
        <div className="text-sm text-gray-500 flex items-center justify-between">
          <span>当前区域：<span className="font-bold text-gray-800">{selectedDistrict}</span></span>
          <span className="text-xs bg-gray-200 px-2 py-1 rounded">共 {getHousingData()[selectedDistrict]?.length || 0} 个片区</span>
        </div>

        {/* 二级筛选容器：搜索框 + 片区下拉 */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-4">
          
          {/* 搜索框 */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className={searchFocused ? "text-blue-500" : "text-gray-400"} />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              placeholder="输入小区名 (如: 华润...)"
              value={searchText}
              onChange={handleSearchInput}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
            {searchText && (
              <button 
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-gray-200 w-full"></div>
            <span className="bg-white px-3 text-xs text-gray-400">或者按片区查看</span>
            <div className="border-t border-gray-200 w-full"></div>
          </div>

          {/* 片区下拉框 */}
          <div className="relative">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin size={16} className="text-gray-400" />
            </div>
            <select
              value={selectedPianqu}
              onChange={handlePianquChange}
              className="block w-full pl-10 pr-10 py-3 text-base border-gray-200 bg-gray-50 border sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 appearance-none"
            >
              <option value="">-- 选择片区浏览 --</option>
              {getHousingData()[selectedDistrict]?.map(pianqu => (
                <option key={pianqu.name} value={pianqu.name}>
                  {pianqu.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <ChevronDown size={16} />
            </div>
          </div>
        </div>

        {/* 结果展示区 */}
        <div className="mt-6">
          {/* 状态 A: 初始空状态 */}
          {!searchText && !selectedPianqu && (
            <div className="text-center py-10 text-gray-400">
              <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <Search size={24} className="opacity-50" />
              </div>
              <p>请选择片区或输入关键词进行查询</p>
            </div>
          )}

          {/* 状态 B: 搜索字数不足 */}
          {searchText && searchText.length < 1 && (
             <div className="text-center py-4 text-orange-500 text-sm bg-orange-50 rounded-lg">
               请输入至少 1 个字符进行精确匹配
             </div>
          )}

          {/* 状态 C: 无结果 */}
          {(searchText.length >= 1 || selectedPianqu) && displayList.length === 0 && (
             <div className="text-center py-10 text-gray-500">
                <p>在该区域下未找到相关小区</p>
                <p className="text-xs text-gray-400 mt-1">试着切换行政区或者缩短搜索词</p>
             </div>
          )}

          {/* 状态 D: 列表展示 */}
          {displayList.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-gray-500 ml-1 mb-2">
                {searchText ? `搜索结果 (${displayList.length})` : `${selectedPianqu} 所有小区 (${displayList.length})`}
              </h3>
              
              {displayList.map((item, index) => (
                <div 
                  key={`${item.pianquName}-${item.estateName}-${index}`}
                  className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex justify-between items-center group active:scale-[0.99]"
                >
                  <div>
                    <h4 className="font-bold text-gray-800 text-lg">{item.estateName}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        {selectedDistrict}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                        {item.pianquName}
                      </span>
                    </div>
                  </div>
                  {/* 右侧箭头 */}
                  <div className="text-gray-300 group-hover:text-blue-500">
                    <Info size={20} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* 底部版权 */}
      <div className="text-center text-gray-300 text-xs py-6">
        Designed for Shenzhen Housing Search
      </div>
    </div>
  );
}