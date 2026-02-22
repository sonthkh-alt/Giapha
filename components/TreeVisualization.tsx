
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { FamilyMember, TreeDataNode } from '../types';
import { Users, UserCheck, AlertCircle } from 'lucide-react';

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
      const approvedOnly = data.filter(m => m.status === 'approved');
      if (viewMode === 'bloodline') {
        return approvedOnly.filter(m => {
          if (isHaMember(m.name)) return true;
          if (m.spouseId) {
            const spouse = approvedOnly.find(s => s.id === m.spouseId);
            return spouse && isHaMember(spouse.name);
          }
          return false;
        });
      }
      return approvedOnly;
    };

    const filteredMembers = getFilteredMembers();

    // 2. Xây dựng cấu trúc cây thông minh
    const buildHierarchy = (members: FamilyMember[]): TreeDataNode => {
      const nodesMap = new Map<string, TreeDataNode>();
      members.forEach(m => {
        nodesMap.set(m.id, { id: m.id, name: m.name, member: m, children: [] });
      });

      const hasParent = new Set<string>();
      members.forEach(m => {
        // Ưu tiên kết nối qua Cha, nhưng nếu Cha là ngoại tộc và Mẹ là Họ Hà, nối qua Mẹ để giữ nhánh trong cây chính
        let parentId = m.fatherId;
        if (m.motherId && m.fatherId) {
          const father = data.find(f => f.id === m.fatherId);
          const mother = data.find(mo => mo.id === m.motherId);
          if (mother && isHaMember(mother.name) && father && !isHaMember(father.name)) {
            parentId = m.motherId;
          }
        } else if (!m.fatherId && m.motherId) {
          parentId = m.motherId;
        }

        if (parentId && nodesMap.has(parentId)) {
          nodesMap.get(parentId)!.children.push(nodesMap.get(m.id)!);
          hasParent.add(m.id);
        }
      });

      const allRoots: TreeDataNode[] = [];
      members.forEach(m => {
        if (!hasParent.has(m.id)) {
          const spouse = m.spouseId ? members.find(s => s.id === m.spouseId) : null;
          if (spouse && !hasParent.has(spouse.id)) {
            if (isHaMember(m.name) || (!isHaMember(spouse.name) && m.id < (spouse.id || ''))) {
              allRoots.push(nodesMap.get(m.id)!);
            }
          } else if (!spouse || !hasParent.has(spouse.id)) {
            allRoots.push(nodesMap.get(m.id)!);
          }
        }
      });

      let mainRoots: TreeDataNode[] = [];
      if (allRoots.length > 0) {
        const patriarch = allRoots.find(r => r.id === 'quan' || isHaMember(r.name));
        if (patriarch) {
          mainRoots = [patriarch];
        } else {
          const getSubtreeSize = (node: TreeDataNode): number => {
            return 1 + node.children.reduce((acc, child) => acc + getSubtreeSize(child), 0);
          };
          mainRoots = [allRoots.sort((a, b) => getSubtreeSize(b) - getSubtreeSize(a))[0]];
        }
      }

      return {
        id: 'virtual-root',
        name: 'Gốc',
        member: { id: 'v0', name: '', gender: 'Other', isDeceased: false },
        children: mainRoots
      };
    };

    const treeData = buildHierarchy(filteredMembers);
    const root = d3.hierarchy(treeData, d => d.children);

    renderTree(root);
  }, [data, viewMode]);

  const renderTree = (initialRoot: d3.HierarchyNode<TreeDataNode>) => {
    if (!svgRef.current || !containerRef.current) return;

    const cardWidth = 190; 
    const cardHeight = 90;
    const spouseGap = 55;
    const duration = 700;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    const g = svg.append("g");

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.05, 3])
      .on("zoom", (event) => g.attr("transform", event.transform));

    svg.call(zoom);

    const { width, height } = containerRef.current.getBoundingClientRect();
    svg.call(zoom.transform, d3.zoomIdentity.translate(width / 2, 120).scale(0.6));

    const update = (source: any) => {
      const treeLayout = d3.tree<TreeDataNode>()
        .nodeSize([cardWidth * 3.6, cardHeight + 230]);

      treeLayout(initialRoot);

      const nodes = initialRoot.descendants().filter(d => d.data.id !== 'virtual-root');
      const links = initialRoot.links().filter(d => d.source.data.id !== 'virtual-root');

      const link = g.selectAll("path.link")
        .data(links, (d: any) => d.target.data.id);

      const linkEnter = link.enter().append("path")
        .attr("class", "link")
        .attr("fill", "none")
        .attr("stroke", "#cbd5e1")
        .attr("stroke-width", 2.5);

      linkEnter.merge(link as any).transition().duration(duration)
        .attr("d", (d: any) => `M${d.source.x},${d.source.y} V${(d.source.y + d.target.y) / 2} H${d.target.x} V${d.target.y}`);

      link.exit().remove();

      const node = g.selectAll("g.node")
        .data(nodes, (d: any) => d.data.id);

      const nodeEnter = node.enter().append("g")
        .attr("class", "node")
        .attr("transform", (d: any) => `translate(${source.x || 0},${source.y || 0})`)
        .attr("opacity", 0);

      const nodeUpdate = nodeEnter.merge(node as any);

      nodeUpdate.transition().duration(duration)
        .attr("transform", (d: any) => `translate(${d.x},${d.y})`)
        .attr("opacity", 1);

      node.exit().remove();

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
            .attr("rx", 18)
            .attr("fill", "white")
            .attr("stroke", themeColor)
            .attr("stroke-width", 3.5)
            .attr("class", "shadow-2xl");

          card.append("path")
            .attr("d", `M0,18 Q0,0 18,0 H${cardWidth-18} Q${cardWidth},0 ${cardWidth},18 V26 H0 Z`)
            .attr("fill", themeColor);

          card.append("clipPath")
            .attr("id", `avatar-clip-${m.id}`)
            .append("circle")
            .attr("cx", 36)
            .attr("cy", 58)
            .attr("r", 28);

          card.append("image")
            .attr("href", m.photoUrl || `https://i.pravatar.cc/120?u=${m.id}`)
            .attr("x", 8)
            .attr("y", 30)
            .attr("width", 56)
            .attr("height", 56)
            .attr("clip-path", `url(#avatar-clip-${m.id})`);

          const content = card.append("g").attr("transform", "translate(75, 54)");

          content.append("text")
            .text(m.name)
            .attr("class", "text-[11px] font-black fill-stone-800")
            .style("font-family", "'Be Vietnam Pro', sans-serif");

          content.append("text")
            .attr("dy", "20")
            .text(() => {
              const bYear = m.birthYear || (m.birthDate ? m.birthDate.split('-')[0] : "?");
              if (m.isDeceased) return `† Mất ${m.deathYear || '?'}`;
              return `✱ Sinh ${bYear}`;
            })
            .attr("class", "text-[10px] fill-stone-500 font-bold uppercase tracking-tighter");
        };

        if (spouse) {
          gNode.append("line")
            .attr("x1", -spouseGap).attr("y1", 0).attr("x2", spouseGap).attr("y2", 0)
            .attr("stroke", "#f59e0b").attr("stroke-width", 4.5).attr("stroke-dasharray", "7,4");
          
          gNode.append("circle").attr("r", 9).attr("fill", "#f59e0b").attr("stroke", "white").attr("stroke-width", 3);

          renderCard(gNode, member, -(cardWidth / 2 + spouseGap / 2));
          renderCard(gNode, spouse, (cardWidth / 2 + spouseGap / 2));
        } else {
          renderCard(gNode, member, 0);
        }

        if (d.data.children.length > 0 || d._children) {
          const isCollapsed = !d.children;
          const toggle = gNode.append("g")
            .attr("transform", `translate(0, ${cardHeight / 2 + 28})`)
            .on("click", (e) => {
              e.stopPropagation();
              if (d.children) { d._children = d.children; d.children = null; }
              else { d.children = d._children; d._children = null; }
              update(d);
            })
            .style("cursor", "pointer");

          toggle.append("circle")
            .attr("r", 17)
            .attr("fill", isCollapsed ? "#b91c1c" : "#fff")
            .attr("stroke", "#b91c1c")
            .attr("stroke-width", 3);

          toggle.append("text")
            .attr("text-anchor", "middle")
            .attr("dy", "8")
            .text(isCollapsed ? "+" : "−")
            .attr("fill", isCollapsed ? "white" : "#b91c1c")
            .attr("font-size", "24px")
            .attr("font-weight", "900");
        }
      });
    };

    update(initialRoot);
  };

  return (
    <div ref={containerRef} className="w-full h-full bg-[#fcfcfb] rounded-2xl overflow-hidden relative border border-stone-200 shadow-inner">
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50">
        <div className="bg-white/95 backdrop-blur-xl p-2 rounded-2xl shadow-2xl border border-stone-200 flex items-center gap-2 ring-1 ring-black/5">
          <button 
            onClick={() => setViewMode('full')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
              viewMode === 'full' ? 'bg-stone-900 text-white shadow-xl scale-105' : 'text-stone-500 hover:bg-stone-100'
            }`}
          >
            <Users size={16} /> Toàn bộ phả hệ
          </button>
          <button 
            onClick={() => setViewMode('bloodline')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
              viewMode === 'bloodline' ? 'bg-red-700 text-white shadow-xl scale-105' : 'text-stone-500 hover:bg-stone-100'
            }`}
          >
            <UserCheck size={16} /> Chỉ Họ Hà
          </button>
        </div>
      </div>

      <div className="absolute top-6 left-6 z-10 flex flex-col gap-3 pointer-events-none">
        <div className="bg-white/95 backdrop-blur-md px-6 py-5 rounded-2xl text-[12px] text-stone-700 border border-stone-200 shadow-xl font-bold flex flex-col gap-3">
           <div className="flex items-center gap-3 border-b border-stone-100 pb-3 mb-1">
             <div className="bg-red-700 text-white w-8 h-8 rounded-lg flex items-center justify-center font-serif text-xl">H</div>
             <span className="uppercase tracking-widest text-[11px]">Ghi chú sơ đồ</span>
          </div>
          <div className="flex items-center gap-3">
             <div className="w-4 h-4 rounded-md bg-red-700 shadow-sm"></div> <span>Huyết thống Họ Hà</span>
          </div>
          <div className="flex items-center gap-3">
             <div className="w-4 h-4 rounded-md bg-blue-600 shadow-sm"></div> <span>Nhánh ngoại tộc</span>
          </div>
          <div className="flex items-center gap-3">
             <div className="w-4 h-4 rounded-md bg-stone-400 shadow-sm"></div> <span>Đã quá vãng</span>
          </div>
        </div>
      </div>
      
      <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing focus:outline-none"></svg>
    </div>
  );
};

export default TreeVisualization;
