<?php
class dashboard {
  protected $conn;
  public function __construct(){ 
    $ip = "192.168.1.203"; 
    $con = array("us"=>"dmt036", "pw"=>"sdtsdt", "db"=>"sdtprod");
    $host = $ip. ":1521/" .$con['db'];    
    $this->conn = oci_connect($con['us'], $con['pw'], $host, 'AL32UTF8');
  }

  public function scheduleData(){
      $sql = "SELECT 
      vdb_type,
      vdb_nbr,
      vdb_comp,
      VDB_DATE,
      TO_CHAR(vdb_date, 'HH24.MI') AS display_time,
      vdb_effdate,
      vdb_driver,
      vdb_car,
      vdb_item,
      vdb_qty,
      vdb_um,
      vdb_status,
      vdb_rmks,
      vdb_user,
      vdb_chr01,
      vdb_chr02,
      vdb_chr03,
      vdb_num01,
      vdb_num02,
      vdb_num03,
      vdb_date01,
      vdb_date02,
      vdb_date03,
      pt_mstr.pt_desc1 AS PRODUCT_NAME
  FROM 
      vdb_det
  JOIN 
      pt_mstr ON vdb_det.vdb_item = pt_mstr.pt_part 
  WHERE 
      TO_DATE(vdb_effdate, 'dd/mm/rr') = TO_DATE(SYSDATE, 'dd/mm/rr')
  ORDER BY 
      vdb_status,
      TO_CHAR(vdb_date, 'HH24.MI'), 
      vdb_nbr"; 

      $objParse = oci_parse($this->conn, $sql);
      oci_execute($objParse, OCI_DEFAULT);
      $result = array();
      while ($row = oci_fetch_assoc($objParse)) {
          $result[] = $row;
      }
      oci_free_statement($objParse);
      return $result;
  }

  public function customerData(){
      $sql = "SELECT 
      vdb_type,
      vdb_nbr,
      vdb_comp,
      VDB_DATE,
      TO_CHAR(vdb_date, 'HH24.MI') AS display_time,
      vdb_effdate,
      vdb_driver,
      vdb_car,
      vdb_item,
      vdb_qty,
      vdb_um,
      vdb_status,
      vdb_rmks,
      vdb_user,
      vdb_chr01,
      vdb_chr02,
      vdb_chr03,
      vdb_num01,
      vdb_num02,
      vdb_num03,
      vdb_date01,
      vdb_date02,
      vdb_date03,
      pt_mstr.pt_desc1 AS PRODUCT_NAME
  FROM 
      vdb_det
  JOIN 
      pt_mstr ON vdb_det.vdb_item = pt_mstr.pt_part 
  WHERE 
      TO_DATE(vdb_effdate, 'dd/mm/rr') = TO_DATE(SYSDATE, 'dd/mm/rr') and vdb_type = 'SDT->CM' 
  ORDER BY 
      vdb_status,
      TO_CHAR(vdb_date, 'HH24.MI'), 
      vdb_nbr"; 

      $objParse = oci_parse($this->conn, $sql);
      oci_execute($objParse, OCI_DEFAULT);
      $result = array();
      while ($row = oci_fetch_assoc($objParse)) {
          $result[] = $row;
      }
      oci_free_statement($objParse);
      return $result;
  }

  public function setTime(){
    $sql = "SELECT WOC_VD_IN, WOC_VD_OUT, WOC_VD_DELAY 
    FROM WOC_CTRL where WOC_VD_DELAY is not null  or WOC_VD_IN is not null  or WOC_VD_OUT is not null";
    $objParse = oci_parse($this->conn, $sql);
    oci_execute($objParse, OCI_DEFAULT);
    $result;
    while ($row = oci_fetch_assoc($objParse)) {
        $result = (object) $row;
    }
    oci_free_statement($objParse);
    return $result;
  }

  public function updateStatus($data) {
    $fetchSql = "SELECT vdb_type,
              vdb_nbr,
              vdb_comp,
              VDB_DATE,
              TO_CHAR(vdb_date, 'HH24.MI') AS display_time,
              vdb_effdate,
              vdb_driver,
              vdb_car,
              vdb_item,
              vdb_qty,
              vdb_um,
              vdb_status,
              vdb_rmks,
              vdb_user
          FROM vdb_det
                 WHERE vdb_status IN ('1', '2') 
                 AND TO_DATE(vdb_effdate, 'dd/mm/rr') = TO_DATE(SYSDATE, 'dd/mm/rr')
                 AND VDB_NBR = :VDB_NBR 
                 AND VDB_TYPE = :VDB_TYPE
                 AND TO_CHAR(vdb_date, 'HH24.MI') = :DISPLAY_TIME
                 ";

    $fetchParse = oci_parse($this->conn, $fetchSql);
    oci_bind_by_name($fetchParse, ':VDB_NBR', $data['VDB_NBR']);
    oci_bind_by_name($fetchParse, ':VDB_TYPE', $data['VDB_TYPE']);
    oci_bind_by_name($fetchParse, ':DISPLAY_TIME', $data['DISPLAY_TIME']);
    oci_execute($fetchParse, OCI_DEFAULT);

    $fetchedData = array();
    while ($row = oci_fetch_assoc($fetchParse)) {
        $fetchedData[] = $row;
    }
    oci_free_statement($fetchParse);

    $updateSql = "UPDATE vdb_det 
                  SET vdb_status = '4' 
                  WHERE vdb_status IN ('1', '2') 
                 AND TO_DATE(vdb_effdate, 'dd/mm/rr') = TO_DATE(SYSDATE, 'dd/mm/rr')
                 AND VDB_NBR = :VDB_NBR 
                 AND VDB_TYPE = :VDB_TYPE
                 AND TO_CHAR(vdb_date, 'HH24.MI') = :DISPLAY_TIME";

    $updateParse = oci_parse($this->conn, $updateSql);

    oci_bind_by_name($updateParse, ':VDB_NBR', $data['VDB_NBR']);
    oci_bind_by_name($updateParse, ':VDB_TYPE', $data['VDB_TYPE']);
    oci_bind_by_name($updateParse, ':DISPLAY_TIME', $data['DISPLAY_TIME']);
    $updateResult = oci_execute($updateParse, OCI_DEFAULT);

    $updateStatus = '';
    if ($updateResult) {
        $rowsAffected = oci_num_rows($updateParse);
        if ($rowsAffected > 0) {
            oci_commit($this->conn);
            $updateStatus = 'Update successful';
        } else {
            $updateStatus = 'No rows updated';
        }
    } else {
        $updateStatus = 'Update failed';
    }

    oci_free_statement($updateParse);

    return array(
      'fetchedData' => $fetchedData,
      'updateStatus' => $updateStatus
    ); 
  }

}
?>