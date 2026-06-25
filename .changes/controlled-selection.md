---
type: feature
pr: 368
---
Selection can now be fully controlled. Pass the selected node ids to the new
`selectedIds` prop and handle `onSelectionChange` to own selection state the way
a controlled `<input value onChange>` works: the prop is the source of truth,
internal interactions report the intended next selection through
`onSelectionChange` instead of mutating it, and changes you make from outside
don't echo back through the handler. The existing single-id `selection` prop and
`onSelect` callback keep working unchanged.
