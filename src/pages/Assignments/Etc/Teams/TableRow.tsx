export const TableRow = ({ personDetails }) => {
    return (
      <>
      {personDetails.map((person, index) => (
        <tr key={index}>
          <td style={{paddingLeft:'20px'}}>{index+1}</td>
          <td></td>
          <td>{person.email}</td>
          <td>{person.name}</td>
        </tr>
      ))}
      </>
    );
  };
  