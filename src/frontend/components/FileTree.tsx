import React from 'react';

interface FileNode {
  name: string;
  type: 'file' | 'directory';
  children?: FileNode[];
  status?: 'committed' | 'modified' | 'staged' | 'untracked';
}

interface FileTreeProps {
  tree: FileNode[];
  onSelect?: (path: string) => void;
  selectedFile?: string | null;
  depth?: number;
  parentPath?: string;
}

const getStatusIcon = (status?: string) => {
  switch (status) {
    case 'committed':
      return <span className="text-green-500">✓</span>;
    case 'modified':
      return <span className="text-yellow-500">●</span>;
    case 'staged':
      return <span className="text-blue-500">+</span>;
    case 'untracked':
      return <span className="text-gray-400">?</span>;
    default:
      return null;
  }
};

const getFileIcon = (type: string, name: string) => {
  if (type === 'directory') {
    return <span className="text-blue-500">📁</span>;
  }
  
  // 根据文件扩展名返回不同图标
  const ext = name.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'ts':
    case 'tsx':
      return <span className="text-blue-600 dark:text-blue-400">📄</span>;
    case 'js':
    case 'jsx':
      return <span className="text-yellow-500">📄</span>;
    case 'css':
      return <span className="text-purple-500">📄</span>;
    case 'md':
      return <span className="text-gray-500">📝</span>;
    case 'json':
      return <span className="text-green-500">⚙️</span>;
    default:
      return <span className="text-gray-400">📄</span>;
  }
};

const FileTreeNode: React.FC<{
  node: FileNode;
  onSelect?: (path: string) => void;
  selectedFile?: string | null;
  depth: number;
  parentPath: string;
}> = ({ node, onSelect, selectedFile, depth, parentPath }) => {
  const [expanded, setExpanded] = React.useState(depth < 2);
  const currentPath = parentPath ? `${parentPath}/${node.name}` : node.name;
  const isSelected = selectedFile === currentPath;

  const handleClick = () => {
    if (node.type === 'directory') {
      setExpanded(!expanded);
    } else {
      onSelect?.(currentPath);
    }
  };

  return (
    <div>
      <div 
        className={`file-tree-item cursor-pointer ${
          isSelected ? 'bg-blue-100 dark:bg-blue-900/30' : ''
        }`}
        style={{ paddingLeft: `${depth * 12 + 12}px` }}
        onClick={handleClick}
      >
        {node.type === 'directory' && (
          <span className="text-gray-400 mr-1">
            {expanded ? '▼' : '▶'}
          </span>
        )}
        {getFileIcon(node.type, node.name)}
        <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">{node.name}</span>
        {node.type === 'file' && getStatusIcon(node.status)}
      </div>
      
      {node.type === 'directory' && expanded && node.children && (
        <div className="animate-fade-in">
          {node.children.map((child, index) => (
            <FileTreeNode
              key={`${currentPath}-${index}`}
              node={child}
              onSelect={onSelect}
              selectedFile={selectedFile}
              depth={depth + 1}
              parentPath={currentPath}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const FileTree: React.FC<FileTreeProps> = ({ 
  tree, 
  onSelect, 
  selectedFile,
  depth = 0,
  parentPath = ''
}) => {
  return (
    <div className="rounded-lg bg-gray-50 dark:bg-gray-900/50 p-2">
      {tree.map((node, index) => (
        <FileTreeNode
          key={`${parentPath}-${index}`}
          node={node}
          onSelect={onSelect}
          selectedFile={selectedFile}
          depth={depth}
          parentPath={parentPath}
        />
      ))}
    </div>
  );
};

export default FileTree;