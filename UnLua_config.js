// ==================================================================
// --- CONFIGURATION FILE ---
//  在这里修改图表结构和节点内容
// ==================================================================

const CONFIG = {
    // --- UI 显示文本配置 ---
    uiStrings: {
        mainTitle: "Unlua",
        dragHint: "(按住 Alt + 左键拖拽画布)",
        searchPlaceholder: "搜索变量/方法 (支持多词)",
        themeToggleButton: "切换主题",
        detailsTitle: "详情",
        variablesTitle: "相关变量 (Variables)",
        methodsTitle: "相关方法 (Methods)",
        searchResultsTitle: (count) => `搜索结果 (${count} 条)`,
        noResults: "没有找到匹配项。",
        copySuccessToast: "函数签名已复制!",
        copyFailToast: "复制失败"
    },

    // --- 图表定义 (支持多个) ---
    diagrams: [
        // {
        //     title: "概述",
        //     definition: `
        //         graph
        //     `
        // },
        {
            title: "Unlua框架 核心类型",
            definition: `
                graph

                subgraph UE层
                    UEnum

                    UScriptStruct
                    UClass

                    FProperty
                    UFunction

                    TFunction
                end
                UEnum --->|注册<br>FEnumRegistry::Register| FEnumRegistry
                FProperty ---> FPropertyDesc
                UFunction ---> FFunctionDesc
                UScriptStruct ---> FClassDesc
                UClass ---> FClassDesc

                subgraph UnLua层[UnLua层<br>FLuaEnv]
                    subgraph 静态导出[静态导出<br>这部分模板满天飞]
                        FExported[FExported<br>静态手动导出<br>在FLuaEnv::FLuaEnv注册]

                        subgraph IExportedClass类
                            IExportedClass
                            --> |派生| TExportedClassBase[TExportedClassBase<br>元表相关]
                            --> |派生| TExportedClass
                        end
                        IExportedClass类      --> FExported

                        subgraph IExportedFunction类
                            IExportedFunction --> |派生| TConstructor
                            IExportedFunction --> |派生| TExportedFunction --> |派生| TExportedStaticMemberFunction
                            IExportedFunction --> |派生| TExportedMemberFunction
                            IExportedFunction --> |派生| TSmartPtrConstructor
                        end
                        IExportedFunction类     --> FExported
                        IExportedEnum           --> FExported
                    end

                    subgraph 反射访问
                        FFieldDesc      --> |以Fields存在于<br>其中包含了Property和Function| FClassDesc
                        FPropertyDesc   --> |以Fields存在于<br>其中包含了Property和Function| FClassDesc
                        FFunctionDesc   --> |以Fields存在于<br>其中包含了Property和Function| FClassDesc

                        FEnumDesc       --> FEnumRegistry
                        FClassDesc      --> FClassRegistry[FClassRegistry<br>元表相关]
                    end
                end
                反射访问 ---->|提供元表| Lua层
                静态导出 ---->|提供元表| Lua层

                subgraph Lua层
                    direction TB

                    Enum访问[访问Enum<br>UE.EnumName]
                    Property访问[访问Property<br>self.CppBpProperty]
                    Function访问[访问Function<br>self:CppBpFunction&lpar;...&rpar;]
                end
            `
        },
    ],

    // --- 在这里配置每个节点的详细信息 ---
    // 注意: nodeDetails 是全局共享的, 所有图表的节点ID都从这里查找
    nodeDetails: {
        'FEnumRegistry': { title: 'FEnumRegistry', 
            variables: [
                { name: 'Enums', type: 'TMap&lt;UEnum*, FEnumDesc*&gt;', desc: '<strong>Cpp枚举类</strong>映射到<strong>UnLua描述符</strong>'},
                { name: 'Name2Enums', type: 'TMap&lt;FString, FEnumDesc*&gt', desc: '<strong>Cpp枚举名字</strong>映射到<strong>UnLua描述符</strong>'}
            ],
            methods: [
                {
                    name: 'Register',
                    desc: `将Cpp层的UEnum枚举注册到Lua层，并且在UnLua层保留一个FEnumDesc索引<ul>
                        <li> 将Enum的名字注册到LUA_REGISTRYINDEX，使用luaL_newmetatable函数的时候会自动写入__name </li>
                        <li> 将Enum这个Object注册到LUA_REGISTRYINDEX的UnLua_ObjectMap </li>
                        <li> 将胶水函数放到metatable，大部分胶水函数里面都依赖__name </li>
                    </ul>
                    `,
                    signature: 'FEnumDesc* Register(UEnum* Enum, lua_CFunction IndexFunc = nullptr)'
                }
            ]
        },
        'FClassRegistry': { title: 'FClassRegistry',
            variables: [
                { name: 'Enums', type: 'TMap&lt;UStruct*, FClassDesc*&gt;', desc: '<strong>Cpp/Bp类</strong>映射到<strong>UnLua描述符</strong>'},
                { name: 'Name2Enums', type: 'TMap&lt;FString, FClassDesc*&gt', desc: '<strong>Cpp/Bp类名字</strong>映射到<strong>UnLua描述符</strong>'}
            ],
            methods: [
                {
                    name: 'Register',
                    desc: `主要是调用PushMetatable`,
                    signature: 'FClassDesc* Register(const char* MetatableName)'
                },
                {
                    name: '【注册元表】PushMetatable',
                    desc: `将Cpp层的类型做成metatable，这个操作不适用于非反射导出<ul>
                        <li> 注册有两个阶段，第一个阶段是注册UnLua层的FClassDesc，第二个阶段是伪造Lua面向对象注册metatable。 </li>
                        <li> 注册metatable的时候，会注册元方法，给Lua层跳到Cpp层进行访问。</li>
                    </ul>
                    `,
                    signature: 'bool PushMetatable(lua_State* L, const char* MetatableName)'
                }
            ]
        },
        'FClassDesc': { title: 'FClassDesc',
            variables: [
                { name: 'Fields', type: 'TMap&lt;FName, TSharedPtr&lt;FFieldDesc&gt;&gt;', desc: '描述当前Class可以访问的Field，包括了Property和Function，用Lua的思维可以很容易理解这个。'},
                { name: 'Properties', type: 'TArray&lt;TSharedPtr&lt;FPropertyDesc&gt;&gt;', desc: '描述当前Class可以访问的Property，通过Field间接索引访问'},
                { name: 'Functions', type: 'TArray&lt;TSharedPtr&lt;FFunctionDesc&gt;&gt;', desc: '描述当前Class可以访问的Function，通过Field间接索引访问'},
                { name: 'SuperClasses', type: 'TArray&lt;FClassDesc*&gt;', desc: '描述当前Class的父类，注意是Cpp/Bp层的父类，不是'},
            ]
        },

        'FFieldDesc': { title: 'FFieldDesc',
            variables: [
                { name: 'FieldIndex', type: 'int32', desc: '这个Field对应的Property或者Function的序号，其中Property为正，Function为负，这是一个很实用的编码技巧。'}
            ],
            methods: [
                {
                    name: 'AsProperty',
                    desc: '获取当前Field对应的Property，需要FieldIndex > 0',
                    signature: 'FORCEINLINE TSharedPtr<FPropertyDesc> AsProperty() const'
                },
                {
                    name: 'AsFunction',
                    desc: '获取当前Field对应的Function，需要FieldIndex < 0',
                    signature: 'FORCEINLINE TSharedPtr<FFunctionDesc> AsFunction() const'
                }
            ]
        },
        'FExported' : { title: 'FExported',
            variables: [
                { name: 'Enums', type: 'TArray&lt;IExportedEnum*&gt', desc: '导出的Enum，不清楚这个还是否使用，因为EKeys直接导出为了Class' },
                { name: 'Functions', type: 'TArray&lt;IExportedFunction*&gt', desc: '导出的Function，不清楚这个还是否使用，看起来没有调用' },
                { name: 'ReflectedClasses', type: 'TMap&lt;FString, IExportedClass*&gt;', desc: '导出的反射Class' },
                { name: 'NonReflectedClasses', type: 'TMap&lt;FString, IExportedClass*&gt;', desc: '导出的非反射Class' },
                { name: 'Types', type: ' TMap&lt;FString, TSharedPtr&lt;ITypeInterface&gt;&gt; Types', desc: '导出的静态Type，给容器Create的时候用的，目前就是基本类型int族/float族/FString族导出了（他们同时也导出了Class，甚至还增加了一个Value变量）' },
            ],
            methods: [
                {
                    name: 'ExportClass',
                    desc: '导出类',
                    signature: 'UNLUA_API void ExportClass(IExportedClass* Class)'
                },
                {
                    name: 'ExportEnum',
                    desc: '导出枚举',
                    signature: 'UNLUA_API void ExportEnum(IExportedEnum* Enum)'
                },
                {
                    name: 'ExportFunction',
                    desc: '导出函数',
                    signature: 'UNLUA_API void ExportFunction(IExportedFunction* Function)'
                },
                {
                    name: 'AddType',
                    desc: '导出基础类型给容器Create使用',
                    signature: 'UNLUA_API void ExportClass(IExportedClass* Class)'
                }
            ]
        },
        'TExportedClassBase': { title: 'TExportedClassBase',
            methods: [
                {
                    name: '【注册元表】Register',
                    desc: `用宏定义的手动导出类元表，注意这个函数会一次性将导出的内容全部写到元表，而不是像反射访问一样，访问的时候每次都走到__index。<ul>
                        <li> 注册Class的metatable </li>
                        <li> 注册Property到metatable </li>
                        <li> 注册Func的metatable </li>
                        <li> 把metatable绑定到UE.[ClassName]上 </li>
                    </ul>`,
                    signature: 'virtual void Register(lua_State *L) override'
                }
            ]
        }
    }
};