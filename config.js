// ==================================================================
// --- CONFIGURATION FILE ---
//  在这里修改图表结构和节点内容
// ==================================================================

const CONFIG = {
    // --- UI 显示文本配置 ---
    uiStrings: {
        mainTitle: "Gameplay Ability System",
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
        {
            title: "概述",
            definition: `
                graph TD
                GAS_Tutorial[相关范式]
            `
        },
        {
            title: "GAS 核心类型",
            definition: `
                graph TD
                subgraph GameplayAbility
                    GA_Tutorial[相关范式]

                    GA_UGameplayAbility[UGameplayAbility<br>技能本身]
                    GA_UGameplayAbility                                 -.->        |Array| GA_UGameplayAbility_Array
                    GA_UGameplayAbility                                 -->         |CDO<br>以脑海中的技能存在于| GA_FGameplayAbilitySpec

                    GA_UGameplayAbility_Array[UGameplayAbility<br>Array]
                    GA_UGameplayAbility_Array@{ shape: processes }
                    GA_UGameplayAbility_Array                           -->         |ReplicatedInstances/NonReplicatedInstances<br>InstancingPolicy相关<br>以释放出的技能存在于| GA_FGameplayAbilitySpec

                    GA_FGameplayAbilitySpec[FGameplayAbilitySpec<br>相当于学会的技能]
                    GA_FGameplayAbilitySpec                             -->         |构造函数调用GenerateNewHandle| GA_FGameplayAbilitySpecHandle
                    GA_FGameplayAbilitySpec                             -.->        |Array| GA_FGameplayAbilitySpec_Array

                    GA_FGameplayAbilitySpec_Array[FGameplayAbilitySpec<br>Array]
                    GA_FGameplayAbilitySpec_Array@{ shape: processes }
                    GA_FGameplayAbilitySpec_Array                       -->         |GiveAbility/ClearAbility相关| GA_FGameplayAbilitySpecContainer
                    
                    GA_FGameplayAbilitySpecHandle[FGameplayAbilitySpecHandle<br>static自增Id全局唯一<br>经常用来作为索引]

                    GA_FGameplayAbilitySpecContainer[FGameplayAbilitySpecContainer]

                    GA_FGameplayAbilitySpecDef[FGameplayAbilitySpecDef]
                    GA_FGameplayAbilitySpecDef                          ---->        |带上GEHandle可以生成| GA_FGameplayAbilitySpec
                    GA_FGameplayAbilitySpecDef                          -.->         |带上GEHandle可以生成| GA_FGameplayAbilitySpecDef_Array

                    GA_FGameplayAbilitySpecDef_Array[FGameplayAbilitySpecDef<br>Array]
                    GA_FGameplayAbilitySpecDef_Array@{ shape: processes }

                    GA_FGameplayEventData[FGameplayEventData<br>通常也被系统称为Payload<br>被项目魔改了<br>魔改ASC:不需要Event驱动]

                    GA_FGameplayAbilityTargetData[FGameplayAbilityTargetData<br>继承之后可以自定义的数据集合]
                    GA_FGameplayAbilityTargetData                       -.->        |Array| GA_FGameplayAbilityTargetData_Array

                    GA_FGameplayAbilityTargetData_Array[FGameplayAbilityTargetData<br>Array]
                    GA_FGameplayAbilityTargetData_Array@{ shape: processes }
                    GA_FGameplayAbilityTargetData_Array                 -->         |被包裹| GA_FGameplayAbilityTargetDataHandle

                    GA_FGameplayAbilityTargetDataHandle[FGameplayAbilityTargetDataHandle]
                    GA_FGameplayAbilityTargetDataHandle                 -->         |装填进入| GA_FGameplayEventData
                end
                GA_FGameplayAbilitySpecContainer                        -->         |ActivatableAbilities<br>Owner激活的GA<br>以学会的技能存在于| ASC_UAbilitySystemComponent
                GA_FGameplayAbilitySpecHandle                           -.->        |GameplayEventTriggeredAbilities<br>存储什么GT可以触发什么GA<br>GA AbilityTriggers相关<br>以Map的Key存在于| ASC_UAbilitySystemComponent
                GA_FGameplayEventData                                   -.-         |原生的GAS,两者通过GA<br>SendGameplayEvent交互<br>魔改后直接EventData作为Activate参数| ASC_UAbilitySystemComponent
                GA_FGameplayAbilitySpecDef_Array                        -->         |作为GrantedAbilitySpecs存在于<br>说明了GE可以GiveGA| GE_FGameplayEffectSpec

                subgraph GameplayEffect
                    GE_Tutorial[相关范式]

                    GE_FGameplayEffectContextHandle[FGameplayEffectContextHandle<br>这个和GASpecHandle/ActiveGEHandle又不一样<br>这玩意是一层SharedPtr包装]
                    GE_FGameplayEffectContextHandle                     --->        |作为EffectContext存在于| GE_FGameplayEffectSpec

                    GE_UGameplayEffect[UGameplayEffect<br>技能修改数据模板]
                    GE_UGameplayEffect                                  -->         |作为Def存在于| GE_FGameplayEffectSpec

                    GE_FGameplayEffectContext[FGameplayEffectContext<br>从GA提取，存储一部分上下文数据<br>部分Actor会在创建时设置<br>]
                    GE_FGameplayEffectContext                           -->         |被包裹<br>SharedPtr| GE_FGameplayEffectContextHandle

                    GE_FActiveGameplayEffect[FActiveGameplayEffect]
                    GE_FActiveGameplayEffect                            -.->        |Array| GE_FActiveGameplayEffect_Array

                    GE_FActiveGameplayEffect_Array[FActiveGameplayEffect<br>Array]
                    GE_FActiveGameplayEffect_Array@{ shape: processes }
                    GE_FActiveGameplayEffect_Array                      -->         |被包裹| GE_FActiveGameplayEffectsContainer

                    GE_FGameplayEffectSpec[FGameplayEffectSpec<br>技能修改数据包<br>所有的与修改相关的实例数据<br>包括了SetByCaller]
                    GE_FGameplayEffectSpec                              -->         |不是所有的有效GE都会传递到Active数组<br>有些可能直接触发完毕了&lpar;Instant&rpar;| GE_FAGEH_FAGE_MP

                    GE_FActiveGameplayEffectHandle[FActiveGameplayEffectHandle]
                    GE_FActiveGameplayEffectHandle                      -->         |这个和GA不一样，是手动生成的，而不是Spec构造时<br>通常使用场景为ApplyGameplayEffectSpec| GE_FAGEH_FAGE_MP

                    GE_FAGEH_FAGE_MP( )
                    style GE_FAGEH_FAGE_MP stroke-width:0,fill:transparent
                    GE_FAGEH_FAGE_MP                                    -->         |一组对应的Spec/SpecHandle存在于| GE_FActiveGameplayEffect

                    GE_FActiveGameplayEffectsContainer[FActiveGameplayEffectsContainer<br>管理GE<br>管理AttributeAggregator]

                    GE_FGameplayEffectAttributeCaptureSpec[FGameplayEffectAttributeCaptureSpec<br>计算草稿和计算数据的绑定<br>向上提供给外部计算结果<br>向下捕获当前ActiveGEContainer下的Attribute对应Aggregator引用]
                    GE_FGameplayEffectAttributeCaptureSpec              -.->        |Array| GE_FGameplayEffectAttributeCaptureSpec_Array

                    GE_FGameplayEffectAttributeCaptureSpec_Array[FGameplayEffectAttributeCaptureSpec<br>Array]
                    GE_FGameplayEffectAttributeCaptureSpec_Array@{ shape: processes }
                    GE_FGameplayEffectAttributeCaptureSpec_Array        -->         GE_FGameplayEffectAttributeCaptureSpecContainer

                    GE_FGameplayEffectAttributeCaptureSpecContainer[FGameplayEffectAttributeCaptureSpecContainer<br>拥有Source和Target的Attribute捕获引用]
                    GE_FGameplayEffectAttributeCaptureSpecContainer     -->         |作为Attribute捕获集合<br>CapturedRelevantAttributes存在于| GE_FGameplayEffectSpec
                end
                GE_FActiveGameplayEffectsContainer                      -->         |ActiveGameplayEffects<br>存储当前运行中的DurationGE| ASC_UAbilitySystemComponent
                GE_FGameplayEffectAttributeCaptureSpec                  -->         |通过ActiveGEContainer绑定| AG_FAggregatorRef

                subgraph Aggregator
                    AG_Tutorial[相关范式]

                    AG_FAggregatorMod[FAggregatorMod<br>修改器参数<br>Result = &lpar;Base + A&rpar; * B / C里面的ABC<br>Result = Override里面的Override]
                    AG_FAggregatorMod                                   -.->        |Array| AG_FAggregatorMod_Array

                    AG_FAggregatorMod_Array[FAggregatorMod<br>Array]
                    AG_FAggregatorMod_Array@{ shape: processes }
                    AG_FAggregatorMod_Array                             -->         |四个数组对应上面的ABC与Override| AG_FAggregatorModChannel

                    AG_FAggregatorModChannel[FAggregatorModChannel<br>修改通道<br>保存了该通道的修改器集合]
                    AG_FAggregatorModChannel                            -.->        |Array| AG_FAggregatorModChannel_Array

                    AG_FAggregatorModChannel_Array[FAggregatorModChannel<br>Array]
                    AG_FAggregatorModChannel_Array@{ shape: processes }
                    AG_FAggregatorModChannel_Array                      -->         |被包裹| AG_FAggregatorModChannelContainer

                    AG_FAggregatorModChannelContainer[FAggregatorModChannelContainer<br>修改通道集合，记录所有通道的修改器<br>通道由小到大依次计算Channel<br>Channel 0的结果是Channel 1的BaseValue]
                    AG_FAggregatorModChannelContainer                   -->         |ModChannels<br>存储在AG_FAggregator中| AG_FAggregator

                    AG_FAggregator[FAggregator<br>GE配置的Modifier最终会变成这个数据<br>对同一个Attribute的修改会被聚合到这里]
                    AG_FAggregator                                      -->         |ShaderPtr<br>被包裹| AG_FAggregatorRef
                end
                AG_FAggregatorRef[FAggregatorRef]                       -->         |TMap&lt;FGameplayAttribute, FAggregatorRef&gt;<br>作为Attribute映射的Aggregator| GE_FActiveGameplayEffectsContainer

                subgraph AttributeSet
                    AS_UAttributeSet[UAttributeSet]

                    AS_FScalableFloat[FScalableFloat]

                    AS_FGameplayAttribute[FGameplayAttribute<br>为了捕获这个值，编辑器上竟然遍历所有的Class<br>详见UpdatePropertyOptions<br>本质是选取Attribute的反射描述符<br>TODO]
                    AS_FGameplayAttribute                               -->         |作为Attribute描述符存在于| AS_FGameplayModifierEvaluatedData

                    AS_FGameplayModifierEvaluatedData[FGameplayModifierEvaluatedData<br>描述了对Attribute的一次操作<br>包括了Attribute描述，Op，Magnitude]
                    AS_FGameplayModifierEvaluatedData                   -->         |作为操作信息EvaluatedData<br>存在于| AS_FGameplayEffectModCallbackData

                    AS_FGameplayEffectModCallbackData[FGameplayEffectModCallbackData<br>描述了因为某个EffectSpec对某个ASC的某次Attribute修改]
                    AS_FGameplayEffectModCallbackData                   -->         |&lpar;Pre/Post&rpar;GEExecute广播| AS_UAttributeSet

                    AS_FGameplayAttributeData[FGameplayAttributeData<br>TODO]
                end
                AS_FScalableFloat                                       -->         |作为ScalableFloatMagnitude| Calc_FGameplayEffectModifierMagnitude
                AS_FGameplayAttribute                                   -->         |作为捕获设定的描述符存在于| Calc_FGameplayEffectAttributeCaptureDefinition

                subgraph Calculator
                    Calc_UGameplayEffectCalculation[UGameplayEffectCalculation<br>计算器的父类<br>本质上是一个AttributeCapture]
                    Calc_UGameplayEffectCalculation                     -->         |子类| Calc_UGameplayModMagnitudeCalculation
                    Calc_UGameplayEffectCalculation                     -->         |子类| Calc_UGameplayEffectExecutionCalculation

                    Calc_UGameplayModMagnitudeCalculation[UGameplayModMagnitudeCalculation<br>服务于Modifier<br>]
                    Calc_UGameplayModMagnitudeCalculation               -->         |CustomMagnitude内嵌的计算器| Calc_FCustomCalculationBasedFloat

                    Calc_UGameplayEffectExecutionCalculation[UGameplayEffectExecutionCalculation<br>服务于Executions<br>通常都是直接拿CDO进行计算]
                    Calc_UGameplayEffectExecutionCalculation            -->         |其Class被包装<br>因为通常只用CDO| Calc_FGameplayEffectExecutionDefinition

                    Calc_FGameplayEffectExecutionDefinition[FGameplayEffectExecutionDefinition]
                    Calc_FGameplayEffectExecutionDefinition             -.->        |Array| Calc_FGameplayEffectExecutionDefinition_Array

                    Calc_FGameplayEffectExecutionDefinition_Array[FGameplayEffectExecutionDefinition<br>Array]
                    Calc_FGameplayEffectExecutionDefinition_Array@{ shape: processes }

                    Calc_FAttributeBasedFloat[FAttributeBasedFloat]
                    Calc_FAttributeBasedFloat                           --->         |作为AttributeBasedMagnitude| Calc_FGameplayEffectModifierMagnitude

                    Calc_FSetByCallerFloat[FSetByCallerFloat]
                    Calc_FSetByCallerFloat                              ---->         |作为SetByCallerMagnitude| Calc_FGameplayEffectModifierMagnitude

                    Calc_FCustomCalculationBasedFloat[FCustomCalculationBasedFloat]
                    Calc_FCustomCalculationBasedFloat                   -->         |作为CustomMagnitude| Calc_FGameplayEffectModifierMagnitude

                    Calc_FGameplayEffectModifierMagnitude[FGameplayEffectModifierMagnitude<br>Modifier的计算类]
                    Calc_FGameplayEffectModifierMagnitude               -->         |被包裹| Calc_FGameplayModifierInfo

                    Calc_FGameplayModifierInfo[FGameplayModifierInfo]
                    Calc_FGameplayModifierInfo                          -.->        |Array| Calc_FGameplayModifierInfo_Array

                    Calc_FGameplayModifierInfo_Array[FGameplayModifierInfo<br>Array]
                    Calc_FGameplayModifierInfo_Array@{ shape: processes }
                    
                    Calc_FGameplayEffectAttributeCaptureDefinition[FGameplayEffectAttributeCaptureDefinition<br>定义需要Capture谁的什么Attribute]
                    Calc_FGameplayEffectAttributeCaptureDefinition      -.->        |Array| Calc_FGameplayEffectAttributeCaptureDefinition_Array

                    Calc_FGameplayEffectAttributeCaptureDefinition_Array[FGameplayEffectAttributeCaptureDefinition<br>Array]
                    Calc_FGameplayEffectAttributeCaptureDefinition_Array@{ shape: processes }
                    Calc_FGameplayEffectAttributeCaptureDefinition_Array-->         |被包裹| Calc_UGameplayEffectCalculation
                    
                end
                %% Calc_FGameplayEffectModifierMagnitude                -->         |其中一种应用<br>SetSetByCallerMagnitude| GE_FGameplayEffectSpec
                Calc_FGameplayModifierInfo_Array                        ---->       |作为Modifiers存在于| GE_UGameplayEffect
                Calc_FGameplayEffectExecutionDefinition_Array           -->         |作为Excution存在于| GE_UGameplayEffect
                Calc_FGameplayEffectAttributeCaptureDefinition          -->         |作为BackingDefinition存在于| GE_FGameplayEffectAttributeCaptureSpec

                subgraph GameplayTags
                    GT_FGameplayTagContainer[FGameplayTagContainer]
                end

                subgraph AbilitySystemComponent
                    ASC_Tutorial[相关范式]

                    ASC_UAbilitySystemComponent[UAbilitySystemComponent]
                end

                subgraph Ability/GameplayTask
                    GTask_Tutorial[相关范式]

                    GTask_UGameplayTask[UGameplayTask<br>任务基类]
                    GTask_UGameplayTask                                 -.->        |Array| GTask_UGameplayTask_Array

                    GTask_UGameplayTask_Array[UGameplayTask<br>Array]
                    GTask_UGameplayTask_Array@{ shape: processes }
                end
                GTask_UGameplayTask_Array                               -->         |ActiveTasks<br>通过ASC<br>以执行中的任务存在于| GA_UGameplayAbility
            `
        },
        {
            title: "Modifier&Aggregator",
            definition: `
                graph TD

                Attribute修改流程_AA[构造GESpec阶段]
                Attribute修改流程_AA --> |传递给ActiveGEContainer| Attribute修改流程_A
                Attribute修改流程_A[ApplyGESpec阶段]

                Attribute修改流程_B[某个GE直接修改BaseValue]
                Attribute修改流程_B --> Attribute修改流程_C
                
                Attribute修改流程_C[直接修改BaseValue]
                Attribute修改流程_C -->|如果这个Attribute<br>没有对应的Aggregator<br>说明Base和Current等价<br>没有额外Buff这一说| Attribute修改流程_CC
                Attribute修改流程_C -->|如果这个Attribute<br>有对应的Aggregator<br>说明Base和Current存在不等价可能| Attribute修改流程_D

                Attribute修改流程_CC[直接修改CurrentValue]

                Attribute修改流程_D[修改Aggregator<br>的BaseValue]
                Attribute修改流程_D --> Attribute修改流程_E

                Attribute修改流程_E[Aggregator标记为Dirty]
                Attribute修改流程_E --->|广播OnDirty| Attribute修改流程_F
                Attribute修改流程_E -->|通知相关的GEHandle| Attribute修改流程_G

                Attribute修改流程_F[Aggregator更新CurrentValue]
                
                Attribute修改流程_G[GE收到引用，更新自己的Modifier引用值<br>自己重新计算一遍当前Modifier的结果<br>GESpec层的Magnitude更新]
                Attribute修改流程_G --> Attribute修改流程_H

                Attribute修改流程_H[GE作用的Aggregator删掉所有当前GE的Modifier<br>再按照之前计算的结果添加回到Aggregator]
                Attribute修改流程_H -->|GE作用的Aggregator又被修改了| Attribute修改流程_E
            `
        }
    ],

    // --- 在这里配置每个节点的详细信息 ---
    // 注意: nodeDetails 是全局共享的, 所有图表的节点ID都从这里查找
    nodeDetails: {
        'Attribute修改流程_AA': { title: '构造GESpec阶段', 
            methods: [
                {
                    name: '功能', 
                    desc: 'GE上面的Modifier除了自己会修改的Attribute，简称Mod_Attr。<br>还会Capture一部分Attribute，简称Cap_Attr。<br>收集所有Cap_Attr的Definition，再CaptureSource。',
                },
                {
                    name: 'Initialize',
                    desc: '<code>SetupAttributeCaptureDefinitions</code><br>收集Definition，包含了Source和Target<br><code>CaptureDataFromSource</code><br>捕获Source，注册Attribute的Aggregator，生成AggregatorRef。',
                    signature: 'void Initialize(const UGameplayEffect* InDef, const FGameplayEffectContextHandle& InEffectContext, float Level = FGameplayEffectConstants::INVALID_LEVEL);'
                }
            ]
        },
        'Attribute修改流程_A': { title: 'ApplyGESpec阶段', 
            methods: [
                {
                    name: '功能', 
                    desc: 'CaptureTarget<br>让GE的Cap_Attr注册回调，一旦Cap_Attr被修改了，通知自己也要修改。<br>让GE的Mod_Attr对应的Aggregator注册上当前GE的Modifier。'
                },
                {
                    name: '部分先验知识',
                    desc: 'GE层的CDO存放了Modifier草稿。<br>GESpec层存放了Modifier的Magnitude计算结果。<br>Aggregator层存放了Attribute的BaseValue，以及当前所有GE对其Buff类Modifier。'
                },
                {
                    name: 'ApplyGameplayEffectSpec',
                    desc: '<code>CaptureAttributeDataFromTarget</code><br>捕获Target<br><code>CalculateModifierMagnitudes</code><br>计算所有Modifiers的值<br><code>RegisterLinkedAggregatorCallbacks</code><br>注册回调，Cap_Attr对应的Aggregator的Dependents里面塞入当前的GEHandle<br><code>AddActiveGameplayEffectGrantedTagsAndModifiers</code><br>遍历所有的Modifier，往Mod_Attr对应的Aggregator添加。注意，这里的条件是PERIOD <= 0。',
                    signature: 'FActiveGameplayEffect* ApplyGameplayEffectSpec(const FGameplayEffectSpec& Spec, FPredictionKey& InPredictionKey, bool& bFoundExistingStackableGE);'
                }
            ]
        },
        'Attribute修改流程_B': { title: '某个GE直接修改BaseValue', 
            methods:[ 
                {
                    name: '功能',
                    desc: '尝试去修改BaseValue',
                },
                {
                    name: 'InternalExecuteMod',
                    desc: '<code>PreGameplayEffectExecute</code><br>Execute前判断是否可计算<br><code>ApplyModToAttribute</code><br>修改BaseValue<br><code>PostGameplayEffectExecute</code><br>Execute后处理',
                    signature: 'bool InternalExecuteMod(FGameplayEffectSpec& Spec, FGameplayModifierEvaluatedData& ModEvalData);',
                }
            ]
        },
        'Attribute修改流程_C': { title: '直接修改BaseValue',
            methods: [
                {
                    name: 'SetAttributeBaseValue',
                    desc: '<code>PreAttributeBaseChange</code><br>BaseValue修改前处理<br><code>DataPtr->SetBaseValue(NewBaseValue);</code><br>修改BaseValue<br><code>PostAttributeBaseChange</code><br>BaseValue修改后处理',
                    signature: 'void SetAttributeBaseValue(FGameplayAttribute Attribute, float NewBaseValue);'
                }
            ]
        },
        'Attribute修改流程_CC': { title: '直接修改CurrentValue',
            methods: [
                {
                    name: 'SetAttributeBaseValue',
                    desc: '<code>InternalUpdateNumericalAttribute(Attribute, NewBaseValue, nullptr);</code><br>直接修改CurrentValue',
                    signature: 'void SetAttributeBaseValue(FGameplayAttribute Attribute, float NewBaseValue);'
                },
                {
                    name: 'SetNumericValueChecked',
                    desc: '最终调用到这里<br><code>PreAttributeChange</code><br>CurrentValue修改前处理<br><code>DataPtr->SetCurrentValue(NewValue);</code><br>修改CurrentValue<br><code>PostAttributeChange</code><br>CurrentValue修改后处理',
                    signature: 'void SetNumericValueChecked(float& NewValue, class UAttributeSet* Dest) const;'
                }
            ]
        },
        'Attribute修改流程_D': { title: '修改Aggregator的BaseValue',
            methods: [
                {
                    name: 'SetAttributeBaseValue',
                    desc: '<code>Aggregator->SetBaseValue(NewBaseValue);</code><br>先修改Aggregator的BaseValue，后续触发链式反应。',
                    signature: 'void SetAttributeBaseValue(FGameplayAttribute Attribute, float NewBaseValue);'
                }
            ]
        },
        'Attribute修改流程_E': { title: 'Aggregator标记为Dirty',
            methods: [
                {
                    name: 'BroadcastOnDirty',
                    desc: '<code>OnDirty.Broadcast(this);</code><br>广播，重计算Aggregator对应的Attribute的CurrentValue。<br><code>ASC->OnMagnitudeDependencyChange(Handle, this);</code><br>广播，通知所有引用了当前Aggregator的GE，重新计算Mod_Attr。',
                    signature: 'void BroadcastOnDirty();'
                }
            ]
        },
        'Attribute修改流程_F': { title: 'Aggregator更新CurrentValue',
            methods: [
                {
                    name: 'OnAttributeAggregatorDirty',
                    desc: '<code>Aggregator->Evaluate(EvaluationParameters)</code><br>重新计算自己。<br><code>InternalUpdateNumericalAttribute(Attribute, NewBaseValue, nullptr);</code><br>直接修改CurrentValue。',
                    signature: 'void OnAttributeAggregatorDirty(FAggregator* Aggregator, FGameplayAttribute Attribute, bool FromRecursiveCall=false);'
                }
            ]
        },
        'Attribute修改流程_G': { title: 'GE收到引用，更新自己的Modifier引用值',
            methods: [
                {
                    name: '功能',
                    desc: 'GE收到Aggregator修改，遍历所有的Modifier，如果当前Cap_Attr的修改的确影响到了自己的Mod_Attr，那么重新计算一遍当前Mod_Attr，并添加到待更新队列',
                },
                {
                    name: 'OnMagnitudeDependencyChange',
                    desc: '<code>AttemptRecalculateMagnitudeFromDependentAggregatorChange</code><br>重计算当前Cap_Attr影响的Mod_Attr。<br><code>AttributesToUpdate.Add(ModDef.Attribute);</code><br>统计所有需要更新的Attribute。<br><code>UpdateAggregatorModMagnitudes</code><br>更新。',
                    signature: 'void OnMagnitudeDependencyChange(FActiveGameplayEffectHandle Handle, const FAggregator* ChangedAgg);'
                }
            ]
        },
        'Attribute修改流程_H': { title: 'GE作用的Aggregator删掉所有当前GE的Modifier',
            methods: [
                {
                    name: 'UpdateAggregatorModMagnitudes',
                    desc: '<code>UpdateAggregatorMod</code><br>更新Mod_Attr对应的Aggregator，先删掉当前GE的Modifier，再添加回去。内部会调用BroadcastOnDirty，触发链式反应。',
                    signature: 'void UpdateAggregatorModMagnitudes(const TSet<FGameplayAttribute>& AttributesToUpdate, FActiveGameplayEffect& ActiveEffect);'
                }
            ]
        },

        // --- 以下是原有的 GAS 节点详情 ---
        'GA_UGameplayAbility': {
            title: 'UGameplayAbility (技能模板)',
            variables: [
                {
                    category: '【核心】身份与关系标签',
                    items: [
                        { name: 'AbilityTags', type: 'FGameplayTagContainer', desc: '【自己身份证】可以相当于当前GA的身份证，GA之间的交互就是在各自的身份证之间完成的，可以被Block，被Cancel，简单点可以想象成狼人杀' },
                        { name: 'CancelAbilitiesWithTag', type: 'FGameplayTagContainer', desc: '【眩晕，打断别的GA】如果当前有生效中GA的身份证里面，和我存在任何一条相同(HasAny)，就被打断' },
                        { name: 'BlockAbilitiesWithTag', type: 'FGameplayTagContainer', desc: '【沉默，阻挡别的GA】给头头(ASC)说，现在我们的系统不准这些身份的人进来了！存放到ASC的BlockedAbilityTags，直到自己GA End' },
                        { name: 'ActivationOwnedTags', type: 'FGameplayTagContainer', desc: '【拉帮结派，数据产生者】和头头(ASC)说，我来了，我还要多带几个人来！通常用作GA触发之后，设置一些GA相关的状态，例如Ability.Block，这里就可以拉小弟State.Blocking。Tips:可以驱动动画的Transition' },
                    ]
                },
                {
                    category: '【核心】激活前置条件',
                    items: [
                        { name: 'ActivationRequiredTags', type: 'FGameplayTagContainer', desc: '【前置条件】问头头(ASC)说，我要的人都来了么？没有都来的话(HasAll)，那我也不来了！' },
                        { name: 'ActivationBlockedTags', type: 'FGameplayTagContainer', desc: '【前置条件】问头头(ASC)说，我不想见的人来了么？如果来了其中任何一个人的话(HasAny)，那我也不来了！' },
                        { name: '(Source/Target)(Required/Blocked)Tags', type: 'FGameplayTagContainer', desc: '【前置条件】这四个和上面类似，只是判断的对象不一样。' },
                        { name: 'AbilityTriggers', type: 'TArray&lt;FAbilityTriggerData&gt;', desc: '【等待戈多，数据消耗者】头头(ASC)把GA加入名单(OnGiveAbility)的时候，就会统计他的诉求，等我要的人来了，再叫我！Tips:可以消耗AnimNotify生产的Tag' },
                    ]
                },
                {
                    category: '【策略配置】',
                    items: [
                        { name: 'InstancingPolicy', type: 'EGameplayAbilityInstancing::Type', desc: '【实例化策略】决定当前的技能能否在Spec里面存在实例，以及实例化的时机，如果选择不需要实例化，那么永远都是使用的CDO。还可以选择PerActor和PerExecution实例化策略，如果GA内部存在需要记录的数据，并且每个Instance不一样，那么就需要考虑这个策略。' },
                        { name: 'ReplicationPolicy', type: 'EGameplayAbilityReplicationPolicy::Type', desc: '【同步策略】决定技能的执行和效果如何在网络中同步。' },
                        { name: 'NetExecutionPolicy', type: 'EGameplayAbilityNetExecutionPolicy::Type', desc: '【执行策略】根据策略看本地跑还是服务器跑、本地' }
                    ]
                },
                {
                    category: '【Task相关】',
                    items: [
                        { name: 'ActiveTasks', type: 'TArray&lt;UGameplayTask*&gt;', desc: '激活的任务集合' }
                    ]
                },
                {
                    category: '【锁相关】',
                    items: [
                        { name: 'ScopeLockCount', type: 'int8', desc: '专门服务于函数ApplyGameplayEffectSpecToTarget，设计上是防止在迭代的时候，修改ASC里面的数据，这里对GA和ASC都会加上锁' },
                        { name: 'WaitingToExecute', type: 'TArray&lt;FPostLockDelegate&gt;', desc: '在上锁的时候，缓存执行的Delegate，后续再执行' }
                    ]
                },
                {
                    category: '【不常用】资源关联GE',
                    items: [
                        { name: 'CooldownGameplayEffectClass', type: 'TSubclassOf&lt;UGameplayEffect&gt;', desc: '【感觉没人用啊】技能冷却所使用的GE模板。' },
                        { name: 'CostGameplayEffectClass', type: 'TSubclassOf&lt;UGameplayEffect&gt;', desc: '【感觉没人用啊】技能消耗所使用的GE模板。' }
                    ]
                },
            ],
            methods: [
                {
                    name: '(K2_)CanActivateAbility',
                    desc: '检查技能当前是否可被激活，蓝图(K2_)在Native函数最后被调用',
                    signature: 'virtual bool CanActivateAbility(const FGameplayAbilitySpecHandle Handle, const FGameplayAbilityActorInfo* ActorInfo, const FGameplayTagContainer* SourceTags = nullptr, const FGameplayTagContainer* TargetTags = nullptr, OUT FGameplayTagContainer* OptionalRelevantTags = nullptr) const'
                },
                {
                    name: 'CallActivateAbility',
                    desc: '很简单的函数，里面执行PreActive和ActivateAbility',
                    signature: 'void CallActivateAbility(const FGameplayAbilitySpecHandle Handle, const FGameplayAbilityActorInfo* ActorInfo, const FGameplayAbilityActivationInfo ActivationInfo, FOnGameplayAbilityEnded::FDelegate* OnGameplayAbilityEndedDelegate = nullptr, const FGameplayEventData* TriggerEventData = nullptr);'
                },
                {
                    name: 'PreActivate',
                    desc: '设置一些执行逻辑前的状态',
                    signature: 'virtual void PreActivate(const FGameplayAbilitySpecHandle Handle, const FGameplayAbilityActorInfo* ActorInfo, const FGameplayAbilityActivationInfo ActivationInfo, FOnGameplayAbilityEnded::FDelegate* OnGameplayAbilityEndedDelegate);'
                },
                {
                    name: '(K2_)ActivateAbility(FromEvent)',
                    desc: '执行当前GA的激活逻辑',
                    signature: 'virtual void ActivateAbility(const FGameplayAbilitySpecHandle Handle, const FGameplayAbilityActorInfo* ActorInfo, const FGameplayAbilityActivationInfo ActivationInfo, const FGameplayEventData* TriggerEventData);'
                },
                {
                    name: '(K2_)CancelAbility',
                    desc: '打断Ability并且通过ASC给客户端发RPC',
                    signature: 'virtual void CancelAbility(const FGameplayAbilitySpecHandle Handle, const FGameplayAbilityActorInfo* ActorInfo, const FGameplayAbilityActivationInfo ActivationInfo, bool bReplicateCancelAbility);'
                },
                {
                    name: '(K2_)EndAbility',
                    desc: '结束当前的Ability，清理相关的任务，并且通过ASC给客户端发RPC，去除ActivationOwnedTags',
                    signature: 'virtual void EndAbility(const FGameplayAbilitySpecHandle Handle, const FGameplayAbilityActorInfo* ActorInfo, const FGameplayAbilityActivationInfo ActivationInfo, bool bReplicateEndAbility, bool bWasCancelled);'
                },
                {
                    name: 'DoesAbilitySatisfyTagRequirements',
                    desc: '判断所有的前置条件(Activation/Source/Target)(Required/Blocked)Tags',
                    signature: 'virtual bool DoesAbilitySatisfyTagRequirements(const UAbilitySystemComponent& AbilitySystemComponent, const FGameplayTagContainer* SourceTags = nullptr, const FGameplayTagContainer* TargetTags = nullptr, OUT FGameplayTagContainer* OptionalRelevantTags = nullptr) const;'
                },
                {
                    name: 'GetAbilityLevel',
                    desc: '获取ASC学会技能的Level',
                    signature: `int32 GetAbilityLevel() const;`
                },
                {
                    name: 'GetAbilityLevel',
                    desc: '获取ASC学会技能或者非实例化(CDO)GA的Level',
                    signature: `int32 GetAbilityLevel(FGameplayAbilitySpecHandle Handle, const FGameplayAbilityActorInfo* ActorInfo) const;`
                },
            ]
        },
        'GA_FGameplayAbilitySpec': {
            title: 'FGameplayAbilitySpec (技能实例)',
            variables: [
                { name: 'Ability', type: 'UGameplayAbility*', desc: '指向技能模板 (UGameplayAbility) 的指针。' },
                { name: 'Level', type: 'int32', desc: '该技能实例的等级。' },
                { name: 'Handle', type: 'FGameplayAbilitySpecHandle', desc: '该实例的唯一ID (FGameplayAbilitySpecHandle)。' },
                { name: 'ActiveInstances', type: 'int32', desc: '记录此技能当前激活了多少次 (用于InstancedPerExecution)。' }
            ],
            methods: [
                { name: 'IsActive', desc: '检查此技能当前是否正在激活中。', signature: 'bool IsActive() const' }
            ]
        },
        'ASC_UAbilitySystemComponent': {
            title: 'UAbilitySystemComponent (核心组件)',
            variables: [
                { name: 'ActivatableAbilities', type: 'FGameplayAbilitySpecContainer', desc: '存储所有已学会的可激活技能。' },
                { name: 'SpawnedAttributes', type: 'TArray&lt;UAttributeSet*&gt;', desc: '持有的所有属性集 (AttributeSet) 的数组。' },
                { name: 'ActiveGameplayEffects', type: 'FActiveGameplayEffectsContainer', desc: '管理所有当前生效的GE。' }
            ],
            methods: [
                {
                    name: 'InitializeComponent',
                    desc: '会初始化ActorInfo，并且通过GetObjectsWithOuter去强行初始化Owner身上的AttributeSet，不是很优雅。注意这个函数是UActorComponent的虚函数，会被AActor::PostSpawnInitialize调用。',
                    signature: 'virtual void InitializeComponent() override;'
                },
                {
                    name: 'InitAbilityActorInfo',
                    desc: '初始化AbilityActorInfo，设置OwnerActor和AvatarActor，其中OwnerActor更贴近于数据，Avatar更贴近于表现，通常两者都可以是Character。',
                    signature: 'virtual void InitAbilityActorInfo(AActor* InOwnerActor, AActor* InAvatarActor);'
                },
                {
                    name: 'TryActivateAbility',
                    desc: '尝试根据Handle激活一个技能。',
                    signature: 'bool TryActivateAbility(FGameplayAbilitySpecHandle AbilityToActivate, bool bAllowRemoteActivation = true)'
                },
                {
                    name: 'ApplyGameplayEffectToSelf',
                    desc: '对自己应用一个GE。如果这个GE不是立即执行，那么就会被放进ActiveGEContainer中，否则直接执行ExecuteGameplayEffect',
                    signature: 'FActiveGameplayEffectHandle ApplyGameplayEffectToSelf(const UGameplayEffect* GameplayEffect, float Level, const FGameplayEffectContextHandle& EffectContext, const FPredictionKey& PredictionKey = FPredictionKey())'
                },
                {
                    name: 'ExecuteGameplayEffect',
                    desc: '立即执行一个GE，通常是Instant的GE。',
                    signature: 'void ExecuteGameplayEffect(FGameplayEffectSpec &Spec, FPredictionKey PredictionKey);'
                },
                {
                    name: 'AddLooseGameplayTag',
                    desc: '直接给组件添加一个GameplayTag。',
                    signature: 'void AddLooseGameplayTag(const FGameplayTag& Tag, int32 Count = 1)'
                },
                {
                    name: 'ApplyAbilityBlockAndCancelTags',
                    desc: '处理阻拦和打断的函数，比较通用，在GA的PreActivate和EndAbility中有使用',
                    signature: 'virtual void ApplyAbilityBlockAndCancelTags(const FGameplayTagContainer& AbilityTags, UGameplayAbility* RequestingAbility, bool bEnableBlockTags, const FGameplayTagContainer& BlockTags, bool bExecuteCancelTags, const FGameplayTagContainer& CancelTags);'
                },
                {
                    name: 'CancelAbilities',
                    desc: '处理Ability的打断，遍历所有的ActivatableAbilities，并且，如果HasAny(WithTags)并且!HasAny(WithoutTags)，两者都满足就处理打断',
                    signature: 'void CancelAbilities(const FGameplayTagContainer* WithTags=nullptr, const FGameplayTagContainer* WithoutTags=nullptr, UGameplayAbility* Ignore=nullptr);'
                },
            ]
        },
        'GA_FGameplayAbilitySpecHandle': { title: 'FGameplayAbilitySpecHandle' },
        'GA_FGameplayAbilitySpecContainer': { title: 'FGameplayAbilitySpecContainer' },
        'GT_FGameplayTagContainer': { title: 'FGameplayTagContainer' },
        'AS_UAttributeSet': {
            title: 'UAttributeSet(核心属性)',
            methods: [
                {
                    name: '【广播：GE】PreGameplayEffectExecute',
                    desc: '在GE应用前调用，可以用来做一些预处理和Check。<br>详见FActiveGameplayEffectsContainer::InternalExecuteMod。',
                    signature: 'virtual bool PreGameplayEffectExecute(struct FGameplayEffectModCallbackData &Data) { return true; }'
                },
                {
                    name: '【广播：GE】PostGameplayEffectExecute',
                    desc: '在GE应用后调用，可以用来做一些后处理。<br>其信息里面存在对Attribute的操作，以及Attribute成员的反射描述符。<br>调用详见FActiveGameplayEffectsContainer::InternalExecuteMod。',
                    signature: 'virtual void PostGameplayEffectExecute(const struct FGameplayEffectModCallbackData &Data) {}'
                },
                {
                    name: '【广播：BaseValue】PreAttributeBaseChange',
                    desc: 'BaseValue设置前，可以用来做一些预处理。<br>详见FActiveGameplayEffectsContainer::SetAttributeBaseValue。',
                    signature: 'virtual void PreAttributeBaseChange(const FGameplayAttribute& Attribute, float& NewValue) const { }'
                },
                {
                    name: '【广播：BaseValue】PostAttributeBaseChange',
                    desc: 'BaseValue设置后，可以用来做一些后处理。<br>调用详见FActiveGameplayEffectsContainer::SetAttributeBaseValue。',
                    signature: 'virtual void PostAttributeBaseChange(const FGameplayAttribute& Attribute, float OldValue, float NewValue) const { }'
                },
                {
                    name: '【广播：CurrentValue】PreAttributeChange',
                    desc: 'CurrentValue设置前，可以用来做一些预处理。<br>详见FActiveGameplayEffectsContainer::SetNumericValueChecked。',
                    signature: 'virtual void PreAttributeChange(const FGameplayAttribute& Attribute, float& NewValue) { }'
                },
                {
                    name: '【广播：CurrentValue】PostAttributeChange',
                    desc: 'CurrentValue设置后，可以用来做一些后处理。<br>调用详见FActiveGameplayEffectsContainer::SetNumericValueChecked。',
                    signature: 'virtual void PostAttributeChange(const FGameplayAttribute& Attribute, float OldValue, float NewValue) { }'
                }
            ]
        },
        'AS_FGameplayAttributeData': {
            title: 'FGameplayAttributeData',
            variables: [
                { name: 'BaseValue', type: 'float', desc: '基础值，通常先被修改' },
                { name: 'CurrentValue', type: 'float', desc: '当前值，通常后被连带修改' },
            ]
        },
        'GE_UGameplayEffect':
        {
            title: 'UGameplayEffect',
            variables: [
                {
                    category: '【核心】修改器相关',
                    items: [
                        { name: 'Modifiers', type: 'TArray&lt;FGameplayModifierInfo&gt;', desc: 'GE拥有的修改器' },
                        { name: 'Executions', type: 'TArray&lt;FGameplayEffectExecutionDefinition&gt', desc: 'GE拥有的计算器' },

                    ]
                },
                {
                    category: '【核心】生命周期相关',
                    items: [
                        { name: 'DurationPolicy', type: 'EGameplayEffectDurationType', desc: 'Duration的类型' },
                        { name: 'DurationMagnitude', type: 'FGameplayEffectModifierMagnitude', desc: 'Duration的计算方法，Spec会保存计算完毕的结果使用' },
                        { name: 'Period', type: 'FScalableFloat', desc: 'Period的计算方法，FScalableFloat可以适配Curve Table的计算' },
                        { name: 'bExecutePeriodicEffectOnApplication', type: 'bool', desc: '是否在最开始的时候执行一次Period的效果，例如Period(5)/Duration(10)，开这个就执行3次，不开就执行2次' },
                    ]
                }
            ],
            methods: [

            ]
        },
        'GE_FGameplayEffectSpec':
        {
            title: 'FGameplayEffectSpec',
            variables: [
                {
                    category: '【核心】GE模板相关',
                    items: [
                        { name: 'Def', type: 'const UGameplayEffect*', desc: '当前Spec拿到的GE模板' },
                    ]
                },
                {
                    category: '【GE触发GA相关】',
                    items: [
                        { name: 'GrantedAbilitySpecs', type: 'TArray&lt;FGameplayAbilitySpecDef&gt;', desc: '当前GE可以触发的GA' },
                    ]
                },
                {
                    category: '【InputContext相关】',
                    items: [
                        { name: 'SetByCallerNameMagnitudes', type: 'TMap&lt;FName, float&gt;', desc: '【Input】GE很多Magnitude可以设置SetByCaller类型，会从这数组里面取值，这个值不会传递' },
                        { name: 'SetByCallerTagMagnitudes', type: 'TMap&lt;FGameplayTag, float&gt;', desc: '【InOut】GE很多Magnitude可以设置SetByCaller类型，会从这数组里面取值，触发GA时，可传递给GA，当GA又触发GE的时候这个值会传递' },
                    ]
                },
                {
                    category: '【Capture相关】',
                    items: [
                        { name: 'CapturedRelevantAttributes', type: 'FGameplayEffectAttributeCaptureSpecContainer', desc: '当前Spec捕获的Attribute引用集合' },
                        { name: 'CapturedSourceTags', type: 'FGameplayTagContainer', desc: '捕获的SourceTags，在RecaptureSourceActorTags捕获' },
                        { name: 'CapturedTargetTags', type: 'FGameplayTagContainer', desc: '捕获的TargetTags' },
                        { name: 'Modifiers', type: 'TArray&lt;FModifierSpec&gt;', desc: '当前计算完毕的Modifier的值，存在这里面，和Def->Modifiers一一对应。' },
                    ]
                }
            ],
            methods: [
                {
                    name: '【核心】Initialize',
                    desc: '通常在构造时调用。<br>初始化当前的数据包，包括了GE模板(Def)、Context、Level、整理所有捕获Attribute、捕获SourceTarget。',
                    signature: 'void Initialize(const UGameplayEffect* InDef, const FGameplayEffectContextHandle& InEffectContext, float Level = FGameplayEffectConstants::INVALID_LEVEL);'
                },
                {
                    name: 'RecaptureSourceActorTags',
                    desc: '从GEContext里面找Tag。<br>原生UE虽然将ActorTag和SpecTag都作为引用传进去，但是SpecTag没有修改。',
                    signature: 'void RecaptureSourceActorTags();'
                },
                {
                    name: 'CalculateModifierMagnitudes',
                    desc: '计算所有Def(GE模板)的Modifier的值，结果保存在自己的Modifiers里面',
                    signature: 'void CalculateModifierMagnitudes();'
                },
                {
                    name: 'AttemptCalculateDurationFromDef',
                    desc: '通过Def计算当前Spec的Duration',
                    signature: 'bool AttemptCalculateDurationFromDef(OUT float& OutDefDuration) const;'
                },
                {
                    name: 'SetSetByCallerMagnitude',
                    desc: '设置SetByCaller的值，用Name当做Key',
                    signature: 'void SetSetByCallerMagnitude(FName DataName, float Magnitude);'
                },
                {
                    name: 'SetSetByCallerMagnitude',
                    desc: '设置SetByCaller的值，用Tag当做Key',
                    signature: 'void SetSetByCallerMagnitude(FGameplayTag DataTag, float Magnitude);'
                },
            ]
        },
        'GE_FActiveGameplayEffectsContainer':
        {
            title: 'FActiveGameplayEffectsContainer',
            methods: [
                {
                    name: '【核心】ApplyGameplayEffectSpec',
                    desc: "【重要函数】将一个GameplayEffectSpec应用到其所有者身上，是处理持续性效果（如拥有时长、无限时长）的核心入口。它管理着从条件检查到效果激活的完整生命周期。<br><br><b>主流程：</b><br>1. <b>条件检查</b>：验证目标的Gameplay Tag是否满足应用要求，并检查是否对该效果免疫。<br>2. <b>堆叠处理</b>：查找已存在的可堆叠效果实例。如果找到，则根据规则更新（如增加层数、刷新时长）；否则，进入创建流程。<br>3. <b>创建实例</b>：根据传入的Spec创建一个新的`FActiveGameplayEffect`运行时实例。<br>4. <b>添加与应用</b>：将新实例添加到容器中进行管理，并立即应用其属性修改（Modifiers）。<br>5. <b>广播通知</b>：触发内部回调和代理，以激活Gameplay Cue等后续逻辑。<br><br><b>核心特性：</b><br>- 支持复杂的<b>效果堆叠</b>逻辑。<br>- 通过`FPredictionKey`参数，原生支持<b>客户端预测</b>。<br>- 清晰分离了Spec（数据定义）与ActiveGameplayEffect（运行时实例）。<br>- 作为效果生命周期（计时、周期性触发）的起点。",
                    signature: 'FActiveGameplayEffect* ApplyGameplayEffectSpec(const FGameplayEffectSpec& Spec, FPredictionKey& InPredictionKey, bool& bFoundExistingStackableGE);'
                },
                {
                    name: '【核心】AddActiveGameplayEffectGrantedTagsAndModifiers',
                    desc: '将GE的多种Tag((Dynamic)GrantedTags/BlockedAbilityTags)添加到ASC中，并且将GE的Modifiers添加到Aggregator中。',
                    signature: 'void AddActiveGameplayEffectGrantedTagsAndModifiers(FActiveGameplayEffect& Effect, bool bInvokeGameplayCueEvents);'
                },
                {
                    name: '【设计有失偏颇】ExecuteActiveEffectsFrom',
                    desc: '执行GESpec，依次执行Modifier，Execution，Cue。<br>这就是GAS我觉得框架设计有点奇怪的地方，自己是Container，却需要输入一个Spec来执行。我最不能理解的就是这个函数上层调用都是从Handle开始访问的，解开Handle的访问我觉得是很变态的一件事情，或者做一个Context来维护上下文关系也行。<br>更多的还有设计了一个迭代器FActiveGameplayEffectIterator，别的地方还是直接for GameplayEffects_Internal。',
                    signature: 'void ExecuteActiveEffectsFrom(FGameplayEffectSpec &Spec, FPredictionKey PredictionKey = FPredictionKey() );'
                },
                {
                    name: '【Attribute相关】InternalExecuteMod',
                    desc: '将算好的Modifier应用到对应的Attribute上，其中的修改被AS的PreGameplayEffectExecute和PostGameplayEffectExecute包夹。',
                    signature: 'bool InternalExecuteMod(FGameplayEffectSpec& Spec, FGameplayModifierEvaluatedData& ModEvalData);'
                },
                {
                    name: '【Capture相关】CaptureAttributeForGameplayEffect',
                    desc: '去获取当前Attribute的Aggregator，并且选择是否去做Snapshot，如果Snapshot则返回当前Attribute的Aggregator快照，否则直接返回其Aggregator。<br>是CaptureSpec和Aggregator的桥梁。',
                    signature: 'void CaptureAttributeForGameplayEffect(OUT FGameplayEffectAttributeCaptureSpec& OutCaptureSpec);'
                },
                {
                    name: '【Capture相关】FindOrCreateAttributeAggregator',
                    desc: '给当前的Attribute构造一个Aggregator，并且创造其OnDirty(Recursive)的Delegate。',
                    signature: 'FAggregatorRef& FindOrCreateAttributeAggregator(FGameplayAttribute Attribute);'
                }
            ]
        },
        'GE_FGameplayEffectContext':
        {
            title: 'FGameplayEffectContext',
            variables: [
                {
                    category: '【网络同步变量】',
                    items: [
                        { name: 'Instigator', type: 'TWeakObjectPtr&lt;AActor&gt;', desc: '【激活侧】携带ASC的Actor，从UGameplayAbility::MakeEffectContext处看相当于OwnerActor' },
                        { name: 'EffectCauser', type: 'TWeakObjectPtr&lt;AActor&gt;', desc: '【激活侧】造成GE的physical actor（个人觉得就是Character或者Inventory这种），从UGameplayAbility::MakeEffectContext处看相当于AvatarActor' },
                    ]
                }
            ],
            methods: [
                {
                    name: 'NetSerialize',
                    desc: '手动处理的网络同步序列化，用了一个RepBits处理，感觉性能会比较好？',
                    signature: 'virtual bool NetSerialize(FArchive& Ar, class UPackageMap* Map, bool& bOutSuccess);'
                },
                {
                    name: 'GetOwnedGameplayTags',
                    desc: '获取Instigator的所有GameplayTags，保存在ActorTagContainer',
                    signature: 'virtual void GetOwnedGameplayTags(OUT FGameplayTagContainer& ActorTagContainer, OUT FGameplayTagContainer& SpecTagContainer) const;'
                }
            ]
        },
        'GE_FGameplayEffectAttributeCaptureSpec':
        {
            title: 'FGameplayEffectAttributeCaptureSpec',
            variables: [
                { name: 'BackingDefinition', type: 'FGameplayEffectAttributeCaptureDefinition', desc: '捕获的Attribute的定义' },
                { name: 'AttributeAggregator', type: 'FAggregatorRef', desc: 'Attribute对应的Aggregator引用' }
            ],
            methods: [
                {
                    name: 'AttemptCalculateAttributeMagnitudeUpToChannel',
                    desc: '计算当前Aggregator在Channel上的结果值',
                    signature: 'bool AttemptCalculateAttributeMagnitudeUpToChannel(const FAggregatorEvaluateParameters& InEvalParams, EGameplayModEvaluationChannel FinalChannel, OUT float& OutMagnitude) const;'
                }
            ]
        },
        'GE_FGameplayEffectAttributeCaptureSpecContainer':
        {
            title: 'FGameplayEffectAttributeCaptureSpecContainer',
            variables: [
                { name: 'SourceAttributes', type: 'TArray&lt;FGameplayEffectAttributeCaptureSpec&gt;', desc: '捕获的SourceAttribute' },
                { name: 'TargetAttributes', type: 'TArray&lt;FGameplayEffectAttributeCaptureSpec&gt;', desc: '捕获的TargetAttribute' }
            ],
            methods: [
                {
                    name: 'AddCaptureDefinition',
                    desc: '增加当前的捕获需求',
                    signature: 'void AddCaptureDefinition(const FGameplayEffectAttributeCaptureDefinition& InCaptureDefinition);'
                },
                {
                    name: 'CaptureAttributes',
                    desc: '执行捕获，通过ASC中转到ActiveGEContainer中去捕获Attribute',
                    signature: 'void CaptureAttributes(class UAbilitySystemComponent* InAbilitySystemComponent, EGameplayEffectAttributeCaptureSource InCaptureSource);'
                }
            ]
        },
        'GE_FGameplayEffectContextHandle':
        {
            title: 'FGameplayEffectContextHandle',
            variables: [
                { name: 'Data', type: 'TSharedPtr&lt;FGameplayEffectContext&gt;', desc: '给Context包裹了一层，不知道为什么叫Handle。' }
            ]
        },
        'GE_FActiveGameplayEffectHandle':
        {
            title: 'FActiveGameplayEffectHandle',
            variables: [
                { name: 'Handle', type: 'int32', desc: '全局唯一标识符' }
            ]
        },
        'AG_FAggregatorRef':
        {
            title: 'FAggregatorRef',
            variables: [
                { name: 'Data', type: 'SharedPtr&lt;FAggregator&gt;', desc: '指向FAggregator的指针。' }
            ],
            methods: [
                {
                    name: 'TakeSnapshotOf',
                    desc: '将自己变成输入的FAggregatorRef的快照。',
                    signature: 'void TakeSnapshotOf(const FAggregatorRef& RefToSnapshot);'
                }
            ]
        },
        'AG_FAggregator':
        {
            title: 'FAggregator',
            variables: [
                { name: 'BaseValue', type: 'float', desc: '基础值' },
                { name: 'ModChannels', type: 'FAggregatorModChannelContainer', desc: '修改通道集合，前一个通道的结果会成为后一个通道的初始值。' }
            ],
            methods: [
                {
                    name: '【核心Qualify】EvaluateQualificationForAllMods',
                    desc: '计算所有修改器资格(是否生效)，通常在Evaluate系列被调用。如果有MetaData，还会调用MetaData的自定义资格计算。',
                    signature: 'void EvaluateQualificationForAllMods(const FAggregatorEvaluateParameters& Parameters) const;'
                },
                {
                    name: '【核心Evaluate】(Reverse)Evaluate(ToChannel/WithBase)',
                    desc: '计算当前Aggregator的结果，内部会计算一次Qualities。<br><ul><li>原始版本是，从最低的通道开始计算，直到最高的通道。</li><li>ReverseEvaluate，则从最高的通道开始计算，直到最低的通道。</li><li>ToChannel是计算到指定的通道</li><li>iWithBase是使用InlineBaseValue作为基础值。</li></ul>',
                    signature: 'float Evaluate(const FAggregatorEvaluateParameters& Parameters) const;'
                },
                {
                    name: '【核心Add】AddAggregatorMod',
                    desc: '添加一个Channel为ModifierChannel的修改器到当前Aggregator的ModChannels中。',
                    signature: 'void AddAggregatorMod(float EvaluatedData, TEnumAsByte<EGameplayModOp::Type> ModifierOp, EGameplayModEvaluationChannel ModifierChannel, const FGameplayTagRequirements*	SourceTagReqs, const FGameplayTagRequirements* TargetTagReqs, bool IsPredicted, FActiveGameplayEffectHandle ActiveHandle = FActiveGameplayEffectHandle() );'
                }
            ]
        },
        'AG_FAggregatorModChannelContainer':
        {
            title: 'FAggregatorModChannelContainer',
            variables: [
                { name: 'ModChannels', type: 'TArray&lt;FAggregatorModChannel&gt;', desc: '修改通道集合，前一个通道的结果会成为后一个通道的初始值。' }
            ],
            methods: [
                {
                    name: '【核心Qualify】EvaluateQualificationForAllMods',
                    desc: '遍历计算所有Channel的修改器资格(是否生效)',
                    signature: 'void EvaluateQualificationForAllMods(const FAggregatorEvaluateParameters& Parameters) const;'
                }
            ]
        },
        'AG_FAggregatorModChannel':
        {
            title: 'FAggregatorModChannel',
            variables: [
                { name: 'Mods', type: 'TArray&lt;FAggregatorMod&gt;', desc: '当前通道的修改器集合，其中Mods根据EGameplayModOp分为四种<ul><li>Additive</li><li>Multiplicative</li><li>Division</li><li>Override</li></ul>' }
            ],
            methods: [
                {
                    name: '【核心Evaluate】EvaluateWithBase',
                    desc: '计算当前通道的结果值，使用FAggregatorEvaluateParameters作为输入参数<br>',
                    signature: 'float EvaluateWithBase(float InlineBaseValue, const FAggregatorEvaluateParameters& Parameters) const;'
                },
                {
                    name: '【核心Qualify】UpdateQualifiesOnAllMods',
                    desc: '计算每一种Mod的资格(是否生效)',
                    signature: 'void UpdateQualifiesOnAllMods(const FAggregatorEvaluateParameters& Parameters) const;'
                },
                {
                    name: '【修改参数】AddMod',
                    desc: '增加一条对应Op的修改器，通常SourceTagReqs和TargetTagReqs从FGameplayModifierInfo获得。',
                    signature: 'void AddMod(float EvaluatedMagnitude, TEnumAsByte<EGameplayModOp::Type> ModOp, const FGameplayTagRequirements* SourceTagReqs, const FGameplayTagRequirements* TargetTagReqs, bool bIsPredicted, const FActiveGameplayEffectHandle& ActiveHandle);'
                }
            ]
        },
        'AG_FAggregatorMod':
        {
            title: 'FAggregatorMod',
            variables: [
                { name: 'SourceTagReqs', type: 'const FGameplayTagRequirements*', desc: 'Source的Tag Filter' },
                { name: 'TargetTagReqs', type: 'const FGameplayTagRequirements*', desc: 'Target的Tag Filter' },
                { name: 'EvaluatedMagnitude', type: 'float', desc: '当前修改器参数的数值' },
                { name: 'ActiveHandle', type: 'FActiveGameplayEffectHandle', desc: '当前修改器对应的ActiveGEHandle，为什么需要这个参数，是因为Aggregator是ActiveGEContainer层级的，这里面管理了所有的ActiveGE。不同的GE的Source和Target不一样，所以需要保存一个ActiveGEHandle去访问当前Mod对应的GE，才能判断上面的Source/TargetTags Filter。' },
            ],
            methods: [
                {
                    name: 'UpdateQualifies',
                    desc: '更新当前通道的Qualifies，',
                    signature: 'void UpdateQualifies(const FAggregatorEvaluateParameters& Parameters) const;'
                }
            ]
        },
        'Calc_FGameplayEffectModifierMagnitude':
        {
            title: 'FGameplayEffectModifierMagnitude',
            variables: [
                { name: 'MagnitudeCalculationType', type: 'EGameplayEffectMagnitudeCalculation', desc: '当前Magnitude类型四种类型，ScalableFloat/AttributeBased/CustomCalculationClass/SetByCaller' },
                { name: 'ScalableFloatMagnitude', type: 'FScalableFloat', desc: '当前Magnitude使用浮点数计算' },
                { name: 'AttributeBasedMagnitude', type: 'FAttributeBasedFloat', desc: '当前Magnitude基于AttributeSet的捕获结果计算' },
                { name: 'CustomMagnitude', type: 'FCustomCalculationBasedFloat', desc: '当前Magnitude直接使用CalculationClass进行计算' },
                { name: 'SetByCallerMagnitude', type: 'FSetByCallerFloat', desc: '当前Magnitude使用GESpec构造时SetByCaller的预设结果，具体用法可以参考Test_SetByCallerStackingDuration' },
            ],
            methods: [
                {
                    name: 'CanCalculateMagnitude',
                    desc: '判断当前的Magnitude能否被计算',
                    signature: 'bool CanCalculateMagnitude(const FGameplayEffectSpec& Spec) const;'
                },
                {
                    name: 'AttemptCalculateMagnitude',
                    desc: '尝试计算当前的Magnitude，会根据CanCalculateMagnitude的结果进行计算，这个Can的结果会返回。',
                    signature: 'bool AttemptCalculateMagnitude(const FGameplayEffectSpec& InRelevantSpec, OUT float& OutCalculatedMagnitude, bool WarnIfSetByCallerFail=true, float DefaultSetbyCaller=0.f) const;'
                },
                {
                    name: 'AttemptRecalculateMagnitudeFromDependentAggregatorChange',
                    desc: '【Aggregator系统】当Attribute的Aggregator变化时，尝试重新计算当前的Magnitude。',
                    signature: 'bool AttemptRecalculateMagnitudeFromDependentAggregatorChange(const FGameplayEffectSpec& InRelevantSpec, OUT float& OutCalculatedMagnitude, const FAggregator* ChangedAggregator) const;'
                }
            ]
        },
        'Calc_UGameplayEffectExecutionCalculation':
        {
            title: 'UGameplayEffectExecutionCalculation',
            methods: [
                {
                    name: 'Execute',
                    desc: '这里面非常重要，将FGameplayEffectCustomExecutionParameters输入进来，然后输出FGameplayEffectCustomExecutionOutput，自己只是一个处理器！',
                    signature: 'void Execute(const FGameplayEffectCustomExecutionParameters& ExecutionParams, FGameplayEffectCustomExecutionOutput& OutExecutionOutput) const;'
                }
            ]
        },
        'Calc_UGameplayEffectCalculation':
        {
            title: 'UGameplayEffectCalculation',
            variables: [
                { name: 'RelevantAttributesToCapture', type: 'TArray&lt;FGameplayEffectAttributeCaptureDefinition&gt;', desc: '捕获' }
            ],
        },
        'Calc_FGameplayEffectAttributeCaptureDefinition':
        {
            title: 'FGameplayEffectAttributeCaptureDefinition',
            variables: [
                { name: 'AttributeToCapture', type: 'FGameplayAttribute', desc: 'Gameplay attribute to capture' },
                { name: 'AttributeSource', type: 'EGameplayEffectAttributeCaptureSource', desc: 'Source of the gameplay attribute' },
                { name: 'bSnapshot', type: 'bool', desc: '这个Snapshot最开始挺难理解的，可以用一个比方，我磕了一瓶攻击药，敌方磕了一瓶防御药，每瓶药的duration都是3s，立马我发射一个寒冰箭，飞行时间是4s，进行伤害计算的时候，需要计算到我的攻击药，但是不能计算到敌方的防御药，也就是我发起攻击是snapshot，敌方防守是非snapshot。<br>所以通常是技能的发起者需要snapshot，技能的接受者不需要snapshot。' },
            ],
        },
        'Calc_FGameplayModifierInfo':
        {
            title: 'FGameplayModifierInfo',
        },
        'Calc_FSetByCallerFloat':
        {
            title: 'FSetByCallerFloat'
        },
        'Calc_FAttributeBasedFloat':
        {
            title: 'FAttributeBasedFloat',
            methods: [
                {
                    name: 'CalculateMagnitude',
                    desc: '计算当前AttributeBasedFloat的结果值，其中会调用',
                }
            ]
        },
        'Calc_FCustomCalculationBasedFloat':
        {
            title: 'FCustomCalculationBasedFloat'
        },
        'GA_Tutorial':
        {
            title: 'GA相关范式',
            methods: [
                {
                    name: 'GA的生命周期',
                    desc: 'GA有两个方面的作用，视作一个技能模板(AbilityTags/AbilityTriggers/Policy等配置)，或一个技能实例(ActiveTask等运行时)。<br>对于ASC来说，学会的技能(FGameplayAbilitySpec)生命周期在GiveAbility和ClearAbility之间。<br>对于一个GA实例来说，其生命周期在ActivateAbility和EndAbility之间。<b>核心：GA的“剧本”是可以持续很长时间的，并非瞬间完成。</b>'
                },
                {
                    name: 'GA -> GE',
                    desc: 'GA通过创建`GameplayEffectSpec`来配置GE。这个Spec是一个中间数据结构，它打包了GE模板、等级、`EffectContext`（法证报告：谁，用什么，对谁）、以及最重要的`SetByCaller`动态数值。<b>GA是`EffectContext`的主要创建者和填充者。</b>'
                },
                {
                    name: 'GA -> GA',
                    desc: '通过`SendGameplayEventToActor`触发其他GA是GAS事件驱动设计的核心。一个GA可以作为事件的“生产者”，而其他配置了`AbilityTriggers`的GA可以作为“消费者”。这使得技能系统可以高度解耦，例如“武器命中事件”可以同时触发“吸血”、“溅射”、“施加Debuff”等多个独立的GA。'
                },
                {
                    name: 'GA的核心武器：AbilityTask (技能任务)',
                    desc: '<b>这是GA能够执行长时程、异步逻辑的根本。</b>Task就像是GA剧本中的一个个“待办事项”。GA可以启动一个Task，然后将执行权交还给游戏主循环，当Task完成时（比如延迟结束、收到网络事件），它会通过委托(Delegate)回调GA，让GA继续执行下一步逻辑。<br><b>常见Task:</b><br>- <b>WaitDelay</b>: 等待一段时间。<br>- <b>WaitTargetData</b>: 等待玩家提供目标数据。<br>- <b>WaitGameplayEvent</b>: 等待一个外部GameplayEvent。<br>- <b>PlayMontageAndWait</b>: 播放一个动画蒙太奇并等待其结束。<br>- <b>WaitAttributeChange</b>: 监视一个属性的变化。'
                },
                {
                    name: 'GA与世界的交互：动画与移动',
                    desc: 'GA并非只在数据层面工作，它通过特定的Task与游戏世界紧密相连。<br>- <b>动画</b>: 使用`AbilityTask_PlayMontageAndWait`可以精确控制角色播放哪个动画，并在动画的特定时间点（通过AnimNotify和GameplayEvent）继续执行技能逻辑。<br>- <b>移动</b>: 使用`AbilityTask_ApplyRootMotion...`系列Task，GA可以驱动角色的`Root Motion`，实现冲锋、跳跃等复杂的位移技能。'
                },
                {
                    name: 'GA的网络魔法：客户端预测 (Prediction)',
                    desc: '为了让操作感觉流畅，GA支持客户端预测。当客户端激活一个技能时，会生成一个<code>PredictionKey</code>。它会立即在本地（预测性地）执行技能逻辑，同时将`PredictionKey`和激活请求一起通过RPC发给服务器。服务器权威执行后，会将结果同步给客户端。客户端根据`PredictionKey`匹配上之前的预测，并根据服务器结果进行校正。<b>这是GAS网络体验优秀的核心。</b>'
                },
                {
                    name: 'GA的代价：Cost & Cooldown (消耗与冷却)【这个通常不太使用】',
                    desc: 'GA自身不直接处理消耗和冷却的数值逻辑，而是通过应用GE来实现。这是一个标准范式：<br>1. <b>检查代价 (CheckCost)</b>: 在激活前，检查`CostGameplayEffect`中的属性修改是否会导致资源为负。<br>2. <b>提交代价 (CommitAbility)</b>: 技能确定要执行后，调用此函数。它会应用`CostGameplayEffect`来真正地扣除资源（如法力值）。<br>3. <b>应用冷却 (ApplyCooldown)</b>: 提交代价后，GA会应用`CooldownGameplayEffect`。这个GE通常是持续性的，它会给ASC添加一个代表“冷却中”的Tag，并在持续时间结束后自动移除该Tag。'
                }
            ]
        },
        'GE_Tutorial':
        {
            title: 'GE相关范式',
            methods: [
                {
                    name: 'GE的“身份”：类型与周期 (Duration)',
                    desc: 'GE有三种基本类型，决定了它的生命周期：<br>- <b>Instant (即时)</b>: 应用后立即执行，然后就消失。用于造成单次伤害、瞬间治疗。<br>- <b>Duration (持续)</b>: 应用后会持续一段时间，到期后自动移除。用于DOT、BUFF、DEBUFF。<br>- <b>Infinite (无限)</b>: 应用后会永久存在，除非被手动移除。用于永久性光环、装备提供的属性加成。'
                },
                {
                    name: 'GE的核心工作：修改属性与标签',
                    desc: 'GE主要通过以下方式影响目标：<br>- <b>Attribute Modifiers</b>: 这是GE最核心的功能。定义了要修改哪个属性（如Health）、操作方式（加、减、乘、覆盖）、以及数值。<br>- <b>Granted Tags</b>: 当GE生效时，可以给目标添加一个或多个GameplayTag。这是实现状态（如眩晕、燃烧、冰冻）的基础。<br>- <b>Granted Abilities</b>: 强大的功能。当GE生效时，可以临时或永久地赋予目标新的技能。例如，一个“恶魔变身”的BUFF GE可以赋予玩家新的恶魔技能。'
                },
                {
                    name: 'GE的“计算逻辑”：Modifier vs Execution',
                    desc: 'GE的数值计算主要有两种方式：<br>- <b>Attribute Based (基于属性)</b>: 直接使用Modifier。数值可以是一个固定值，也可以引用某个属性值（例如伤害值等于“攻击力”属性的50%）。简单直接，配置驱动。<br>- <b>Custom Execution Calculation (自定义计算)</b>: 使用`GameplayEffectExecutionCalculation` C++类。这允许你编写任意复杂的计算逻辑，可以捕获源和目标的多个属性，进行复杂的公式计算（如考虑护甲、抗性、暴击、等级差异等），最后输出最终的属性修改量。<b>所有复杂的伤害计算都应使用Execution。</b>'
                },
                {
                    name: 'GE的“应用条件与免疫”',
                    desc: 'GE并非总能成功应用。通过`Application Tag Requirements`可以设置应用的前置条件：<br>- <b>Ongoing Tag Requirements</b>: 目标必须拥有这些Tag，GE才能应用。<br>- <b>Ignore Tag Requirements</b>: 如果目标拥有这些Tag，GE将无法应用。<b>这就是实现“火焰免疫”（拥有`State.Immunity.Fire`标签）等逻辑的地方。</b>'
                },
                {
                    name: 'GE的“堆叠规则” (Stacking)',
                    desc: '当一个目标已经有了一个GE，再次对他应用同一个GE时会发生什么？由堆叠规则决定。<br>- <b>Aggregate by Source/Target</b>: 每个施法者/所有施法者共享一个GE实例，刷新持续时间或增加层数。<br>- <b>Stack Limit</b>: 可以设置最大堆叠层数。层数可以影响Modifier的最终数值。例如，每层“中毒”GE使伤害增加10%。'
                },
                {
                    name: 'GE的“表现层”：GameplayCue',
                    desc: 'GE本身只负责数据和逻辑，不负责视觉表现。<b>GameplayCue是连接GE和特效/音效的桥梁。</b>GE可以设置在“被应用时”、“执行时”、“被移除时”触发哪个GameplayCue（通过GameplayTag匹配）。GameplayCue是一个独立的蓝图或Actor，负责播放粒子特效、声音、屏幕震动等。<b>这使得数据逻辑和视觉表现完美解耦。</b>'
                },
                {
                    name: 'GE的“法证报告”：EffectContext',
                    desc: '每个被应用的GE都携带一个`EffectContext`。这个“报告”记录了效果的完整因果链：谁发起的、由哪个技能、用什么东西造成的。这对于后续的逻辑判断（如伤害来源反弹、击杀归属）和调试至关重要。'
                }
            ]
        },
        'ASC_Tutorial':
        {
            title: 'ASC (组件) 相关范式',
            methods: [
                {
                    name: 'ASC的“身份”：核心中枢与数据中心',
                    desc: 'ASC是Owner Actor（通常是PlayerState或AI Controller）的组件，但它在逻辑上与Avatar Actor（通常是Character）紧密绑定。<b>它的核心职责是：管理该Actor所拥有的所有技能（Abilities）、效果（Effects）、属性（Attributes）和标签（Tags）。</b>它是一个集中的数据中心和事件总线。'
                },
                {
                    name: 'ASC作为“技能书”：管理Abilities',
                    desc: 'ASC通过`FGameplayAbilitySpecContainer`（即`ActivatableAbilities`）存储所有已学会的技能。主要操作包括：<br>- <b>GiveAbility (赋予技能)</b>: 将一个技能模板（UGameplayAbility）添加到ASC中，创建一个`FGameplayAbilitySpec`实例并返回一个唯一的`Handle`。<br>- <b>ClearAbility (移除技能)</b>: 通过Handle移除一个已学会的技能。<br>- <b>TryActivateAbility (尝试激活)</b>: 这是从外部（如玩家输入）触发技能最常用的方式。它会根据Handle找到对应的Spec，检查能否激活，如果可以则执行。'
                },
                {
                    name: 'ASC作为“状态面板”：管理Attributes',
                    desc: 'ASC拥有并管理一个或多个`AttributeSet`。它不直接存储属性值（值在AttributeSet里），但它是所有属性修改的<b>唯一入口</b>。<br>- <b>获取属性</b>: 提供了`GetNumericAttribute()`等函数来安全地获取属性的最终值（BaseValue + Buffs）。<br>- <b>修改属性</b>: 外部不应直接修改AttributeSet。所有修改都应通过向ASC应用一个GE来完成，这是为了确保网络同步和可预测性。'
                },
                {
                    name: 'ASC作为“Buff/Debuff栏”：管理Effects',
                    desc: 'ASC通过`FActiveGameplayEffectsContainer`管理所有当前生效的GE实例（`FActiveGameplayEffect`）。<br>- <b>ApplyGameplayEffectToSelf/Target</b>: 这是将GE应用到角色身上的标准接口。<br>- <b>RemoveActiveGameplayEffect</b>: 通过Handle移除一个持续性或无限期的GE。<br>- <b>GetActiveEffects</b>: 可以查询当前ASC上所有生效的GE，用于UI显示或逻辑判断。'
                },
                {
                    name: 'ASC作为“标签板”：管理Tags',
                    desc: 'ASC维护着一个`FGameplayTagCountContainer`，聚合了所有来源的GameplayTag（来自生效的GE、激活的GA等）。它是所有状态判断的权威来源。<br>- <b>HasMatchingGameplayTag</b>: 检查角色当前是否拥有某个Tag（例如 `State.Stunned`），这是技能激活条件检查的核心。<br>- <b>Add/RemoveLooseGameplayTag</b>: 可以直接给ASC添加或移除“松散”的Tag，用于一些不适合用GE管理的临时状态。'
                },
                {
                    name: 'ASC作为“事件中心”：处理事件与委托',
                    desc: 'ASC是许多事件的广播者和处理者。<br>- <b>HandleGameplayEvent</b>: 接收外部通过`SendGameplayEventToActor`发来的事件，并将其分发给正在等待此事件的AbilityTask。<br>- <b>各种委托 (Delegates)</b>: ASC暴露了大量的委托，如`OnGameplayEffectAppliedDelegate`、`OnAnyGameplayTagChangedDelegate`，外部系统（如UI、声音系统）可以绑定这些委托来响应GAS内部的状态变化。'
                },
                {
                    name: 'ASC的网络角色：同步的协调者',
                    desc: 'ASC在网络同步中扮演着关键角色。<br>- <b>Replicated Attributes</b>: 它负责将AttributeSet中的属性标记为`Replicated`。<br>- <b>Replicated Tags</b>: 它负责将聚合后的GameplayTag同步到客户端。<br>- <b>Generic Replicated Objects</b>: 它管理`FActiveGameplayEffect`和`FGameplayAbilitySpec`的网络复制，确保客户端拥有正确的技能和效果信息。<br>- <b>RPCs</b>: 它提供了许多Server/Client/Multicast RPC，作为GA和GE网络通信的底层通道。'
                }
            ]
        },
        'GTask_Tutorial':
        {
            title: 'AbilityTask (技能任务) 范式',
            methods: [
                {
                    name: 'Task的“身份”：GA的异步执行单元',
                    desc: 'AbilityTask是一个UObject，它封装了一个**异步的、可等待的**操作。它使得GA可以执行一个耗时的操作（如等待动画播放完）而**不会阻塞游戏线程**。<b>它是GA实现复杂、长时程、事件驱动逻辑的基石。</b>一个GA实例可以同时激活和管理多个Task。'
                },
                {
                    name: 'Task的“生命周期”：创建 -> 激活 -> 等待 -> 回调 -> 结束',
                    desc: '1. <b>创建 (NewObject)</b>: 在GA内部，通过调用静态的工厂函数（如`UAbilityTask_WaitDelay::WaitDelay()`）来创建Task的实例。<br>2. <b>激活 (Activate)</b>: 创建后，Task的`Activate()`函数被调用。它在这里启动真正的异步逻辑（如设置一个Timer、绑定一个外部委托）。<br>3. <b>等待</b>: Task进入等待状态，GA的执行流继续向下或暂时挂起。<br>4. <b>回调 (Delegate Broadcast)</b>: 当异步事件完成时（Timer到期、收到网络消息），Task会广播它的输出委托（如`OnFinish`）。<br>5. <b>结束 (EndTask)</b>: 绑定了委托的GA函数被执行。通常在这个函数里，或者当GA被取消时，会调用`EndTask()`来清理并销毁这个Task。'
                },
                {
                    name: 'Task与GA的“契约”：委托 (Delegates)',
                    desc: 'Task与创建它的GA之间通过委托进行通信。Task上会声明多个`F...DynamicDelegate`类型的成员，代表不同的输出路径。<br><b>例如 `UAbilityTask_WaitTargetData` 有：</b><br>- `ValidData`: 成功接收到目标数据时触发。<br>- `Cancelled`: 目标选择被取消时触发。<br>在GA中，创建Task后，你需要将GA的成员函数绑定到这些委托上，以定义“当...发生时，应该做什么”。'
                },
                {
                    name: 'Task的网络同步',
                    desc: '许多Task都需要处理网络同步，特别是那些等待服务器响应的Task。<br>- <b>WaitConfirm/WaitCancel</b>: 这是一个常见的模式。Task会等待一个来自服务器的通用RPC回调，来得知预测的操作是被确认还是被取消了。<br>- <b>Call Server/Client RPC</b>: Task内部可以直接调用其所属GA的RPC函数来与远程端通信。<br>- <b>`WaitNetSync`</b>: 一种特殊的Task，用于在客户端创建一个“同步点”，等待服务器的一个标记，确保客户端和服务器的逻辑在某个点上是对齐的。'
                },
                {
                    name: 'Task的“分类”：常见的任务模式',
                    desc: 'GAS自带了丰富的Task，涵盖了绝大多数需求：<br>- <b>时间类</b>: `WaitDelay`, `WaitFrameChange` (等待下一帧)。<br>- <b>输入/目标类</b>: `WaitTargetData`, `WaitInputPress/Release` (等待玩家按键)。<br>- <b>事件/数据类</b>: `WaitGameplayEvent`, `WaitAttributeChange`, `WaitGameplayTagAdded/Removed`。<br>- <b>世界交互类</b>: `PlayMontageAndWait` (动画), `ApplyRootMotion...` (移动), `WaitOverlap` (触发器)。'
                },
                {
                    name: '自定义Task：扩展GA的能力',
                    desc: '当内置Task不满足需求时，你可以创建自己的Task子类。这是扩展GAS能力最直接、最强大的方式。<br><b>自定义Task的步骤：</b><br>1. 创建一个继承自`UAbilityTask`的C++类。<br>2. 声明输出委托（如`FGenericGameplayTaskDelegate OnSuccess;`）。<br>3. 创建一个静态的工厂函数（如`static UMyTask* MyAwesomeTask(...)`），这是蓝图中创建此Task的节点。<br>4. 实现`Activate()`函数，在这里启动你的异步逻辑。<br>5. 在你的异步逻辑完成时，广播对应的委托。'
                }
            ]
        },
        'AG_Tutorial':
        {
            title: 'Aggregator范式',
            methods: [
                {
                    name: 'Channel计算官方文档，这个将Aggregator和Channel的计算过程描绘的很清晰。',
                    desc: 'https://dev.epicgames.com/community/learning/tutorials/JG2a/unreal-engine-gameplay-ability-system-modifier-evaluation-channels'
                },
                {
                    name: '功能',
                    desc: '本质上是辅助GE，来计算Attribute的工具，这个工具起到了多个作用。更加本质点，他其实更像Attribute的代理，扩展了处理Buff这种功能。<br><ul>\
                    <li>在GESpec Capture的时候，创造捕获Attribute的Aggregator。Aggregator是一个Attribute+多组Modifier</li>\
                    <li>Aggregator相当于Attribute的扩展计算器，不直接修改BaseValue，而是基于BaseValue计算出CurrentValue。</li>\
                    <li>Aggregator在BaseValue被修改之后，标记Dirty，此时需要重新计算CurrentValue，部分运行时FScopedAggregatorOnDirtyBatch还会辅助这个Dirty广播过程。</li>\
                    <li>通常Aggregator机制，在GE没有Period的时候生效，其Modifier会放入Aggregator。</li>\
                    <li>捕获的Attribute，如果开启了Snapshot，相当于一个副本，这个副本不再与原始Attribute关联，也就是BaseValue修改的时候也不会影响结果了</li></ul>',
                },
                {
                    name: '使用',
                    desc: 'Aggregator系统更像一个Buff,如果我们要创建一个，玩家攻击力提升20%的Buff，时长10s，假设攻击力Attribute为Strength<ul>\
                    <li>创建GE，Duration为10s，Period为0<li>\
                    <li>增加修改Modifier，类型为AttributeBase，并且BackingAttribute就是Strength，设置非Snapshot。</li>\
                    <li>中途即使修改Strength的BaseValue，Strength会根据Attribute找到自己的Aggregator，并且广播Dirty</li>\
                    <li>此时Aggregator重新计算出正确的值。如果BaseValue增加了10，那么对应的CurrentValue会增加12</li></ul>'
                }
            ]
        },
        'GAS_Tutorial':
        {
            methods: [
                {
                    name: 'GAS的架构设计',
                    desc: '看了很久GAS，其实大概能够理解他希望做成这样的一个框架，Definition -> Spec -> Container，可以具体参考如下几条轨迹<br><ul>\
                    <li>GA：UGameplayAbility -> FGameplayAbilitySpec -> FGameplayAbilitySpecContainer</li>\
                    <li>GE：UGameplayEffect -> FGameplayEffectSpec -> FActiveGameplayEffectsContainer</li>\
                    <li>Capture：FGameplayEffectAttributeCaptureDefinition -> FGameplayEffectAttributeCaptureSpec -> FGameplayEffectAttributeCaptureSpecContainer</li>\
                    <li>此条为AI生成，Attribute的Definition是UAttributeSet，Spec是FGameplayAttribute，Container是FAggregator</li></ul>\
                    这三条轨迹，分别对应了GAS的三大核心功能，技能，效果，属性。'
                }
            ]
        }
    }
};