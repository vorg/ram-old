Ram = Ram || {}

Ram.Utils = (() ->
  getModernOffsets = (node) ->
    selection = window.getSelection();

    if selection.rangeCount == 0
      return null

    anchorNode = selection.anchorNode;
    anchorOffset = selection.anchorOffset;
    focusNode = selection.focusNode;
    focusOffset = selection.focusOffset;

    currentRange = selection.getRangeAt(0);
    rangeLength = currentRange.toString().length;

    tempRange = currentRange.cloneRange();
    tempRange.selectNodeContents(node);
    tempRange.setEnd(currentRange.startContainer, currentRange.startOffset);

    start = tempRange.toString().length;
    end = start + rangeLength;

    #Detect whether the selection is backward.
    detectionRange = document.createRange();
    detectionRange.setStart(anchorNode, anchorOffset);
    detectionRange.setEnd(focusNode, focusOffset);
    isBackward = detectionRange.collapsed;
    detectionRange.detach();

    return {
      start: if isBackward then end else start,
      end: if isBackward then start else end
    }

  setModernOffsets = (node, offsets) ->
    selection = window.getSelection()

    length = node.textContent.length;
    start = Math.min(offsets.start, length);
    end = if typeof offsets.end == 'undefined' then start else Math.min(offsets.end, length)

    if !selection.extend && start > end
      temp = end;
      end = start;
      start = temp;

    startMarker = getNodeForCharacterOffset(node, start);
    endMarker = getNodeForCharacterOffset(node, end);

    if startMarker && endMarker
      range = document.createRange();
      range.setStart(startMarker.node, startMarker.offset);
      selection.removeAllRanges();

      if start > end
        selection.addRange(range);
        selection.extend(endMarker.node, endMarker.offset);
      else
        range.setEnd(endMarker.node, endMarker.offset);
        selection.addRange(range);

      range.detach()

  getLeafNode = (node) ->
    node = node.firstChild  while node and node.firstChild
    node

  getSiblingNode = (node) ->
    while node
      if node.nextSibling
        return node.nextSibling
      node = node.parentNode;

  getNodeForCharacterOffset = (root, offset) ->
    node = getLeafNode(root)
    nodeStart = 0
    nodeEnd = 0
    while node
      if node.nodeType is 3
        nodeEnd = nodeStart + node.textContent.length
        if nodeStart <= offset and nodeEnd >= offset
          return (
            node: node
            offset: offset - nodeStart
          )
        nodeStart = nodeEnd
      node = getLeafNode(getSiblingNode(node))
    return

  setEndOfContenteditable = (contentEditableElement) ->
    if document.createRange #Firefox, Chrome, Opera, Safari, IE 9+
      range = document.createRange()
      range.selectNodeContents(contentEditableElement)
      range.collapse(false)
      selection = window.getSelection()
      selection.removeAllRanges()
      selection.addRange(range)
    contentEditableElement.focus()

  return {
    getModernOffsets: getModernOffsets
    setModernOffsets: setModernOffsets
    setEndOfContenteditable: setEndOfContenteditable
  }
)()