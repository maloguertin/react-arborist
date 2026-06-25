import clsx from "clsx";
import Link from "next/link";
import { useMemo, useState } from "react";
import { NodeRendererProps, Tree } from "react-arborist";
import { FiChevronDown, FiChevronRight, FiFile, FiFolder } from "react-icons/fi";
import { FillFlexParent } from "../components/fill-flex-parent";
import styles from "../styles/ControlledSelection.module.css";

type Data = { id: string; name: string; children?: Data[] };

const data: Data[] = [
  {
    id: "src",
    name: "src",
    children: [
      {
        id: "components",
        name: "components",
        children: [
          { id: "tree.tsx", name: "Tree.tsx" },
          { id: "row.tsx", name: "Row.tsx" },
          { id: "node.tsx", name: "Node.tsx" },
        ],
      },
      {
        id: "hooks",
        name: "hooks",
        children: [
          { id: "use-selection.ts", name: "useSelection.ts" },
          { id: "use-tree.ts", name: "useTree.ts" },
        ],
      },
      { id: "index.ts", name: "index.ts" },
    ],
  },
  {
    id: "docs",
    name: "docs",
    children: [
      { id: "readme.md", name: "README.md" },
      { id: "changelog.md", name: "CHANGELOG.md" },
    ],
  },
  { id: "package.json", name: "package.json" },
];

function collectLeafIds(nodes: Data[], acc: string[] = []): string[] {
  for (const node of nodes) {
    if (node.children) collectLeafIds(node.children, acc);
    else acc.push(node.id);
  }
  return acc;
}

export default function ControlledSelection() {
  /* The parent owns the selection. The tree never mutates it on its own. */
  const [selectedIds, setSelectedIds] = useState<string[]>(["tree.tsx"]);
  const [readOnly, setReadOnly] = useState(false);
  /* Proof that onSelectionChange fires only for changes made *inside* the
     tree — the external-control buttons below set state directly and never
     bump this counter. */
  const [internalChanges, setInternalChanges] = useState(0);

  const allLeafIds = useMemo(() => collectLeafIds(data), []);

  return (
    <div className={styles.container}>
      <div className={styles.split}>
        <div className={styles.treeContainer}>
          <FillFlexParent>
            {(dimens) => (
              <Tree
                {...dimens}
                initialData={data}
                openByDefault
                rowHeight={32}
                indent={20}
                padding={15}
                className={styles.tree}
                rowClassName={styles.row}
                /* Controlled selection: the prop is the single source of truth. */
                selectedIds={selectedIds}
                /* Omit the handler to make the selection read-only. */
                onSelectionChange={
                  readOnly
                    ? undefined
                    : (nodes) => {
                        setSelectedIds(nodes.map((n) => n.id));
                        setInternalChanges((c) => c + 1);
                      }
                }
              >
                {Node}
              </Tree>
            )}
          </FillFlexParent>
        </div>

        <div className={styles.contentContainer}>
          <h1>Fully Controlled Selection</h1>
          <p>
            Selection here is a <b>controlled component</b>. The parent passes the selected ids to
            the <code>selectedIds</code> prop and updates them from <code>onSelectionChange</code> —
            exactly like a controlled <code>&lt;input value onChange&gt;</code>.
          </p>
          <p>
            Try clicking, <kbd>Cmd/Ctrl</kbd>+click, <kbd>Shift</kbd>+click, and <kbd>Cmd/Ctrl</kbd>
            +<kbd>A</kbd>. Each interaction reports the <i>intended</i> next selection through{" "}
            <code>onSelectionChange</code>; the tree only re-renders once the parent feeds the new
            value back through <code>selectedIds</code>.
          </p>

          <section>
            <label>
              Change the selection <i>from outside the tree</i> (sets state directly — note these do{" "}
              <b>not</b> fire <code>onSelectionChange</code>):
            </label>
            <div className={styles.controls}>
              <button onClick={() => setSelectedIds(allLeafIds)}>Select all files</button>
              <button onClick={() => setSelectedIds(["readme.md", "changelog.md"])}>
                Select docs/*
              </button>
              <button onClick={() => setSelectedIds(["tree.tsx"])}>Select Tree.tsx</button>
              <button disabled={selectedIds.length === 0} onClick={() => setSelectedIds([])}>
                Clear
              </button>
            </div>
          </section>

          <section>
            <label className={styles.toggle}>
              <input type="checkbox" checked={readOnly} onChange={() => setReadOnly((v) => !v)} />
              Read-only (omit <code>onSelectionChange</code> — interactions can&apos;t change the
              selection)
            </label>
          </section>

          <div className={styles.statsgrid}>
            <section className={styles.infobox}>
              <label>Selected</label>
              <div className={styles.stat}>{selectedIds.length}</div>
            </section>
            <section className={styles.infobox}>
              <label>Internal changes</label>
              <div className={styles.stat}>{internalChanges}</div>
            </section>
          </div>

          <section>
            <label>
              Live <code>selectedIds</code> state (owned by the parent):
            </label>
            <div className={styles.chips}>
              {selectedIds.length === 0 ? (
                <span className={styles.muted}>(empty)</span>
              ) : (
                selectedIds.map((id) => (
                  <span key={id} className={styles.chip}>
                    {id}
                  </span>
                ))
              )}
            </div>
          </section>

          <p>
            <Link href="/">Back To Demos</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function Node({ node, style, dragHandle }: NodeRendererProps<Data>) {
  const Icon = node.isInternal ? FiFolder : FiFile;
  return (
    <div
      ref={dragHandle}
      style={style}
      className={clsx(styles.node, node.state)}
      onClick={() => node.isInternal && node.toggle()}
    >
      <span className={styles.arrow}>
        {node.isInternal ? node.isOpen ? <FiChevronDown /> : <FiChevronRight /> : null}
      </span>
      <Icon className={styles.icon} />
      <span className={styles.text}>{node.data.name}</span>
    </div>
  );
}
