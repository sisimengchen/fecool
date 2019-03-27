<?php 
  $MOCK_TIMESTAMP$ = json_decode(file_get_contents('$MOCK_PATH$'));
  foreach ($MOCK_TIMESTAMP$ as $name => $value) {
    $$name = $value;
  }
  unset($MOCK_TIMESTAMP$);
?>