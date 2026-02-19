
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { FamilyMember, TreeDataNode } from './types';
import { Users, UserCheck } from 'lucide-react';

interface Props {
  data: FamilyMember[];
  onMemberClick: (member: FamilyMember) => void;
}

const TreeVisualization: React.FC<Props> = ({ data, onMemberClick }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<'full' | 'bloodline'>('full');

  const isHaMember = (name: string) => name.trim().startsWith('Hà ');

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || data.length === 0) return;

    // 1. Lọc dữ liệu dựa trên chế độ xem
    const getFilteredMembers = () => {
      if (viewMode === 'full') return data;
      
      // Chế độ huyết thống: Giữ người họ Hà và vợ/chồng của họ
      return data.filter(m => {
        const isHa = isHaMember(m.name);
        if (isHa) return true;
        
        // Nếu không phải họ Hà, kiểm tra xem có phải vợ/chồng của người họ Hà không
        if (m.spouseId) {
          const spouse = data.find(s => s.id === m.spouseId);
          return spouse && isHaMember(spouse.name);
        }
        return false;
      });
    };

    const filteredMembers = getFilteredMembers();

    // 2. Chuẩn bị dữ liệu phân cấp
    const buildHierarchy = (members: FamilyMember[]): TreeDataNode => {
      const nodesMap = new Map<string, TreeDataNode>();
      
      members.forEach(m => {
        nodesMap.set(m.id, { id: m.id, name: m.name, member: m, children: [] });
      });

      const roots: TreeDataNode[] = [];
      const hasParent = new Set<string>();

      members.forEach(m => {
        const parentId = m.fatherId || m.motherId;
        // Chỉ liên kết nếu cả cha/mẹ và con đều nằm trong danh sách đã lọc
        if (parentId && nodesMap.has(parentId)) {
          nodesMap.get(parentId)!.children.push(nodesMap.get(m.id)!);
          hasParent.add(m.id);
        }
      });

      members.forEach(m => {
        if (!hasParent.has(m.id)) {
          const spouse = m.spouseId ? members.find(s => s.id === m.spouseId) : null;
          if (spouse && !hasParent.has(spouse.id)) {
            if (isHaMember(m.name)) {
              roots.push(nodesMap.get(m.id)!);
            } else if (!isHaMember(spouse.name) && m.id < (spouse.id || '')) {
              roots.push(nodesMap.get(m.id)!);
            }
          } else {
            roots.push(nodesMap.get(m.id)!);
          }
        }
      });

      return {
        id: 'virtual-root',
        name: 'Gốc',
        member: { id: 'v0', name: '', gender: 'Other', isDeceased: false },
        children: roots
      };
    };

    const treeData = buildHierarchy(filteredMembers);
    const root = d3.hierarchy(treeData, d => d.children);

    renderTree(root);
  }, [data, viewMode]);

  const renderTree = (initialRoot: d3.HierarchyNode<TreeDataNode>) => {
    if (!svgRef.current || !containerRef.current) return;

    const cardWidth = 140;
    const cardHeight = 80;
    const spouseGap = 45;
    const duration = 600;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    const g = svg.append("g");

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.05, 3])
      .on("zoom", (event) => g.attr("transform", event.transform));

    svg.call(zoom);

    const { width, height } = containerRef.current.getBoundingClientRect();
    svg.call(zoom.transform, d3.zoomIdentity.translate(width / 2, 100).scale(0.7));

    const update = (source: any) => {
      const treeLayout = d3.tree<TreeDataNode>()
        .nodeSize([cardWidth * 3.8, cardHeight + 180]);

      treeLayout(initialRoot);

      const nodes = initialRoot.descendants().filter(d => d.data.id !== 'virtual-root');
      const links = initialRoot.links().filter(d => d.source.data.id !== 'virtual-root');

      const link = g.selectAll("path.link")
        .data(links, (d: any) => d.target.data.id);

      const linkEnter = link.enter().append("path")
        .attr("class", "link")
        .attr("fill", "none")
        .attr("stroke", "#cbd5e1")
        .attr("stroke-width", 2)
        .attr("d", (d: any) => {
          const o = { x: source.x0 || source.x, y: source.y0 || source.y };
          return `M${o.x},${o.y} V${o.y} H${o.x} V${o.y}`;
        });

      linkEnter.merge(link as any).transition().duration(duration)
        .attr("d", (d: any) => `M${d.source.x},${d.source.y} V${(d.source.y + d.target.y) / 2} H${d.target.x} V${d.target.y}`);

      link.exit().transition().duration(duration)
        .attr("d", (d: any) => `M${source.x},${source.y} V${source.y} H${source.x} V${source.y}`)
        .remove();

      const node = g.selectAll("g.node")
        .data(nodes, (d: any) => d.data.id);

      const nodeEnter = node.enter().append("g")
        .attr("class", "node")
        .attr("transform", (d: any) => `translate(${source.x0 || source.x},${source.y0 || source.y})`)
        .attr("opacity", 0);

      const nodeUpdate = nodeEnter.merge(node as any);

      nodeUpdate.transition().duration(duration)
        .attr("transform", (d: any) => `translate(${d.x},${d.y})`)
        .attr("opacity", 1);

      node.exit().transition().duration(duration)
        .attr("transform", (d: any) => `translate(${source.x},${source.y})`)
        .attr("opacity", 0)
        .remove();

      nodeUpdate.each(function(d: any) {
        const gNode = d3.select(this);
        gNode.selectAll("*").remove(); 

        const member = d.data.member;
        const spouse = member.spouseId ? data.find(m => m.id === member.spouseId) : null;

        const renderCard = (selection: any, m: FamilyMember, xOff: number) => {
          const isBlood = isHaMember(m.name);
          const card = selection.append("g")
            .attr("transform", `translate(${xOff - cardWidth / 2}, ${-cardHeight / 2})`)
            .on("click", (e: any) => { e.stopPropagation(); onMemberClick(m); })
            .style("cursor", "pointer");

          const themeColor = m.isDeceased ? "#94a3b8" : (isBlood ? "#b91c1c" : "#2563eb");
          
          card.append("rect")
            .attr("width", cardWidth)
            .attr("height", cardHeight)
            .attr("rx", 14)
            .attr("fill", "white")
            .attr("stroke", themeColor)
            .attr("stroke-width", 2.5)
            .attr("class", "shadow-sm");

          card.append("path")
            .attr("d", `M0,14 Q0,0 14,0 H${cardWidth-14} Q${cardWidth},0 ${cardWidth},14 V18 H0 Z`)
            .attr("fill", themeColor);

          // Avatar
          card.append("clipPath")
            .attr("id", `avatar-clip-${m.id}`)
            .append("circle")
            .attr("cx", 28)
            .attr("cy", 48)
            .attr("r", 20);

          card.append("image")
            .attr("href", m.photoUrl || `https://i.pravatar.cc/80?u=${m.id}`)
            .attr("x", 8)
            .attr("y", 28)
            .attr("width", 40)
            .attr("height", 40)
            .attr("clip-path", `url(#avatar-clip-${m.id})`);

          const content = card.append("g").attr("transform", "translate(55, 42)");

          content.append("text")
            .text(m.name.split(' ').slice(-2).join(' ')) // Show last 2 words of name
            .attr("class", "text-[10px] font-bold fill-stone-800")
            .style("font-family", "inherit");

          content.append("text")
            .attr("dy", "15")
            .text(() => {
              if (m.isDeceased) return `† ${m.deathYear || '?'}`;
              return `✱ ${m.birthYear || (m.birthDate ? m.birthDate.split('-')[0] : "?")}`;
            })
            .attr("class", "text-[9px] fill-stone-400 font-semibold");
        };

        if (spouse) {
          gNode.append("line")
            .attr("x1", -spouseGap).attr("y1", 0).attr("x2", spouseGap).attr("y2", 0)
            .attr("stroke", "#f59e0b").attr("stroke-width", 3).attr("stroke-dasharray", "5,3");
          
          gNode.append("circle").attr("r", 6).attr("fill", "#f59e0b").attr("stroke", "white").attr("stroke-width", 2);

          renderCard(gNode, member, -(cardWidth / 2 + spouseGap / 2));
          renderCard(gNode, spouse, (cardWidth / 2 + spouseGap / 2));
        } else {
          renderCard(gNode, member, 0);
        }

        if (d.data.children.length > 0 || d._children) {
          const isCollapsed = !d.children;
          const toggle = gNode.append("g")
            .attr("transform", `translate(0, ${cardHeight / 2 + 18})`)
            .on("click", (e) => {
              e.stopPropagation();
              if (d.children) {
                d._children = d.children;
                d.children = null;
              } else {
                d.children = d._children;
                d._children = null;
              }
              update(d);
            })
            .style("cursor", "pointer");

          toggle.append("circle")
            .attr("r", 12)
            .attr("fill", isCollapsed ? "#b91c1c" : "#f1f5f9")
            .attr("stroke", isCollapsed ? "#b91c1c" : "#cbd5e1")
            .attr("stroke-width", 1.5);

          toggle.append("text")
            .attr("text-anchor", "middle")
            .attr("dy", "5")
            .text(isCollapsed ? "+" : "−")
            .attr("fill", isCollapsed ? "white" : "#64748b")
            .attr("font-size", "16px")
            .attr("font-weight", "bold");
        }
      });

      nodes.forEach((d: any) => {
        d.x0 = d.x;
        d.y0 = d.y;
      });
    };

    update(initialRoot);
  };

  return (
    <div ref={containerRef} className="w-full h-full bg-[#fafaf9] rounded-2xl overflow-hidden relative border border-stone-200 shadow-inner">
      {/* View Mode Toggle */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20">
        <div className="bg-white/90 backdrop-blur-md p-1.5 rounded-2xl shadow-xl border border-stone-200 flex items-center gap-1">
          <button 
            onClick={() => setViewMode('full')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${viewMode === 'full' ? 'bg-stone-800 text-white shadow-lg' : 'text-stone-500 hover:bg-stone-100'}`}
          >
            <Users size={14} />
            Xem đầy đủ
          </button>
          <button 
            onClick={() => setViewMode('bloodline')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${viewMode === 'bloodline' ? 'bg-red-700 text-white shadow-lg' : 'text-stone-500 hover:bg-stone-100'}`}
          >
            <UserCheck size={14} />
            Chỉ Huyết thống Họ Hà
          </button>
        </div>
      </div>

      <div className="absolute top-6 left-6 z-10 flex flex-col gap-3 pointer-events-none">
        <div className="bg-white/95 backdrop-blur-md px-5 py-3 rounded-2xl text-[12px] text-stone-700 border border-stone-200 shadow-lg font-bold flex flex-col gap-2">
           <div className="flex items-center gap-3 border-b border-stone-100 pb-2 mb-1">
             <div className="bg-red-700 text-white w-6 h-6 rounded-md flex items-center justify-center font-serif">H</div>
             <span>SƠ ĐỒ GIA PHẢ CHI TIẾT</span>
          </div>
          <div className="flex items-center gap-2 text-[10px]">
             <div className="w-3 h-3 rounded-full bg-red-700"></div> Huyết thống dòng họ Hà
          </div>
          <div className="flex items-center gap-2 text-[10px]">
             <div className="w-3 h-3 rounded-full bg-blue-600"></div> Con cháu ngoại tộc
          </div>
          <div className="flex items-center gap-2 text-[10px]">
             <div className="w-3 h-3 rounded-full bg-stone-400"></div> Người đã quá vãng
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur px-4 py-2 rounded-xl text-[10px] text-stone-500 border border-stone-100 italic shadow-sm">
          * Nhấn (-) để thu gọn các nhánh con
        </div>
      </div>
      
      <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing focus:outline-none"></svg>
    </div>
  );
};

export default TreeVisualization;
