"use client";

import React, { useMemo } from "react";
import Tree from "react-d3-tree";
import { TreeNode } from "@/lib/api/mlm";
import { User, Shield } from "lucide-react";

interface D3NodeDatum {
    name: string;
    attributes?: Record<string, string | number | boolean>;
    children?: D3NodeDatum[];
    isPlaceholder?: boolean;
}

interface BinaryTreeProps {
    nodes: TreeNode[];
    onNodeClick?: (node: D3NodeDatum) => void;
    type?: 'binary' | 'unilevel';
}

export const BinaryTree: React.FC<BinaryTreeProps> = ({ nodes, onNodeClick, type = 'binary' }) => {
    // Transform flat nodes based on requested type
    const treeData = useMemo(() => {
        if (!nodes || nodes.length === 0) return null;

        const nodeMap = new Map();

        // First pass: Create all real nodes
        nodes.forEach((node) => {
            const userData = typeof node.user === 'object' ? node.user : { _id: (node.user as string), name: 'Unknown', username: 'unknown', rank: 'Starter' };
            nodeMap.set(node._id, {
                name: userData.username,
                attributes: {
                    fullName: userData.name,
                    rank: node.rank || userData.rank || 'Starter',
                    id: node._id,
                    userId: userData._id,
                    leftVolume: node.leftLegVolume || 0,
                    rightVolume: node.rightLegVolume || 0,
                    leftCount: node.leftDescendantCount || 0,
                    rightCount: node.rightDescendantCount || 0,
                    joinDate: node.joinDate,
                    sponsor: node.sponsor
                },
                children: []
            });
        });

        let root = null;

        // Second pass: Connect children
        nodes.forEach((node) => {
            const d3Node = nodeMap.get(node._id);
            if (type === 'binary') {
                if (node.position === 'root' || !node.parent) {
                    root = d3Node;
                } else {
                    const parent = nodeMap.get(node.parent);
                    if (parent) {
                        if (parent.children.length === 0) parent.children = [null, null];
                        if (node.position === 'left') parent.children[0] = d3Node;
                        else parent.children[1] = d3Node;
                    }
                }
            } else {
                // Unilevel (Sponsor Tree)
                // We find the top-level node (usually the one with NO sponsor in the current result set)
                const parentId = node.sponsor;
                const parent = nodeMap.get(parentId);
                if (!parentId || !parent) {
                    // Try to find if this node is the highest in the current set
                    root = d3Node;
                } else {
                    parent.children.push(d3Node);
                }
            }
        });

        // Third pass (Binary only): Fill null slots with placeholders
        if (type === 'binary' && root) {
            const fillPlaceholders = (node: D3NodeDatum) => {
                if (!node) return;
                if (!node.children || node.children.length === 0) {
                    node.children = [
                        { name: "+", isPlaceholder: true },
                        { name: "+", isPlaceholder: true }
                    ];
                } else {
                    if (node.children[0] === null) node.children[0] = { name: "+", isPlaceholder: true };
                    if (node.children[1] === null) node.children[1] = { name: "+", isPlaceholder: true };

                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    if (!node.children[0].isPlaceholder) fillPlaceholders(node.children[0] as any);
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    if (!node.children[1].isPlaceholder) fillPlaceholders(node.children[1] as any);
                }
            };
            fillPlaceholders(root);
        }

        return root;
    }, [nodes, type]);

    const containerStyles: React.CSSProperties = {
        width: "100%",
        height: "700px",
        background: "transparent",
        overflow: "hidden"
    };

    const renderCustomNodeElement = ({ nodeDatum, toggleNode }: { nodeDatum: D3NodeDatum; toggleNode: () => void }) => {
        const isPlaceholder = nodeDatum.isPlaceholder;
        const rank = nodeDatum.attributes?.rank;

        // Colors based on mockup
        const getRankColor = (r: string) => {
            switch (r?.toLowerCase()) {
                case 'admin': return '#10b981';
                case 'pro': return '#10b981';
                case 'enterprise': return '#EC4899';
                default: return '#10B981';
            }
        };

        const rankColor = getRankColor(String(rank || 'Starter'));

        return (
            <g onClick={() => {
                if (!isPlaceholder && onNodeClick) onNodeClick(nodeDatum);
                toggleNode();
            }}>
                {/* Glow Effect */}
                {!isPlaceholder && (
                    <circle r="40" fill={rankColor} opacity="0.15" />
                )}

                {/* Main Circle */}
                <circle
                    r={isPlaceholder ? "20" : "32"}
                    fill="#161B22"
                    stroke={isPlaceholder ? "rgba(255,255,255,0.1)" : rankColor}
                    strokeWidth={isPlaceholder ? "1.5" : "2.5"}
                    strokeDasharray={isPlaceholder ? "4" : "0"}
                    className="transition-all duration-300 hover:scale-110 cursor-pointer"
                />

                {/* Content */}
                {isPlaceholder ? (
                    <text
                        fill="rgba(255,255,255,0.3)"
                        x="0"
                        y="6"
                        textAnchor="middle"
                        style={{ fontSize: "20px", fontWeight: "300" }}
                    >
                        +
                    </text>
                ) : (
                    <>
                        {/* Avatar/Icon Placeholder */}
                        <foreignObject x="-16" y="-16" width="32" height="32" className="pointer-events-none">
                            <div className="flex items-center justify-center w-full h-full" style={{ color: rankColor }}>
                                {rank === 'Admin' ? <Shield size={20} /> : <User size={20} />}
                            </div>
                        </foreignObject>

                        {/* Label */}
                        <text
                            fill="white"
                            x="0"
                            y="55"
                            textAnchor="middle"
                            style={{ fontSize: "11px", fontWeight: "700", textTransform: "lowercase" }}
                        >
                            {nodeDatum.name}
                        </text>
                    </>
                )}
            </g>
        );
    };

    if (!treeData) {
        return (
            <div style={containerStyles} className="flex flex-col items-center justify-center gap-4 text-gray-500">
                <div className="w-12 h-12 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                <p className="text-[10px] font-black uppercase tracking-widest">Inference In Progress...</p>
            </div>
        );
    }

    return (
        <div id="treeWrapper" style={containerStyles}>
            <Tree
                data={treeData}
                translate={{ x: 500, y: 100 }}
                orientation="vertical"
                pathFunc="step"
                collapsible={true}
                renderCustomNodeElement={renderCustomNodeElement}
                separation={{ siblings: type === 'binary' ? 2 : 1.5, nonSiblings: 2.5 }}
                nodeSize={{ x: 220, y: 180 }}
            />
        </div>
    );
};
