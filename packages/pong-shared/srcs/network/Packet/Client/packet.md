# game structure:

## Network management: 
    
    there have 2 type of packet based on the same logic system
    Packet sent by the client to the server have prefix C<ID>
    Packet sent by the server to the client have prefix S<ID> 
    Each packet implement <C-S>Base packet who own:
        - a timestamp 
        - a kind of serialize (kind of vritual)method
    Server or client can send one packet for each derived from '<C-S>Base' per tick
    Packet aren't sent by game loop directly, we use a packet sender

### Packet sender:

    Packet sender are an async loop who recived packets to send in a deque
    The sender loop on his deque and call serialize function for each packet
    Then he send it to the target

### NetworkManager:
    
    This part handle the packet received who is also async
    Network manager read UPD conection and wait for BYTEMAP received
    Whene a BYTEMAP is handled by the NetworkManager:
        - the BYTEMAP is sent to the PacketDispatcher

### PacketDispatcher:
    
    The PacketDispatcher is a listener that waits for BYTEMAPs received
    when a BYTEMAP is recived it is deserialize using the deserializer

### Client to server Packets:
    - C00Base:
        - timestamp
    - C01Move:
        - Direction
        - coord
    - C03BallBase
    - C04BallVelo inherit[C03BallPos]:
        - velo
    - C05BallPos inherit[C03BallPos]:
        - coord
    - C06BallPosVelo inherit[C03BallBase]:
        - C04
        - C05

    [ timestamp   ][ type      ][ size           ]
    [ 64B         ][ 8B        ][ depend on type ]

    
    [             ][ 0000 0001 ][ 0O          ] 00
    [             ][ 0000 0011 ][ 128B | 16o  ] 01
    [             ][ 0000 0101 ][ 0B          ] 03
    [             ][ 0000 1101 ][ 128B | 16o  ] 04
    [             ][ 0001 0101 ][ 128B | 16o  ] 05
    [             ][ 0001 1101 ][ 256B | 32o  ] 06

### Server to client Packets
    
    - S00Base:
        - timestamp
    - S0AInitGame:
        - idk
    - S01ServerTickConfirmation:
        - noting
    - S02oponentsState:
        - Oponents:
            - coord
            - hitbox
    - S02ReSync implement[S0AInitGame:]:
        - noting
    - S03BallBase
    - S04BallVeloChange inherit[S03BallBase]:
        - velo
    - S05BallCoordSync inherit[S03BallBase]:
        - coord
    - S06BallSync inherit[S03BallBase]:
        - S04
        - S05

