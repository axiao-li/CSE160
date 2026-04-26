class Camera {
    constructor() {
        this.fov = 60;
        this.eye = new Vector3([0, 0, 3]);
        this.at = new Vector3([0, 0, -1]);
        this.up = new Vector3([0, 1, 0]);
        this.viewMatrix = new Matrix4();
        this.viewMatrix.setLookAt(...this.eye.elements, ...this.at.elements, ...this.up.elements);
        this.projectionMatrix = new Matrix4();
        this.projectionMatrix.setPerspective(this.fov, canvas.width / canvas.height, 0.1, 1000);
    }

    moveForward(speed) {
        let f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        f.normalize();
        f.mul(speed);
        this.eye.add(f);
        this.at.add(f);
        this.updateViewMatrix();
    }

    moveBackward(speed) {
        let f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        f.normalize();
        f.mul(-speed);
        this.eye.add(f);
        this.at.add(f);
        this.updateViewMatrix();
    }

    moveLeft(speed) {
        let f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        // f.normalize();
        let s = Vector3.cross(this.up, f);
        s.normalize();
        s.mul(speed);
        this.eye.add(s);
        this.at.add(s);
        this.updateViewMatrix();
    }

    moveRight(speed) {
        let f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        let s = Vector3.cross(f, this.up);
        s.normalize();
        s.mul(speed);
        this.eye.add(s);
        this.at.add(s);
        this.updateViewMatrix();
    }

    panLeft(alpha) {
        let f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        let rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(alpha, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        let f_prime = rotationMatrix.multiplyVector3(f);
        this.at.set(f_prime);
        this.at.add(this.eye);
        this.updateViewMatrix();
    }

    panRight(alpha) {
        this.panLeft(-alpha);
    }

    updateViewMatrix() {
        this.viewMatrix.setLookAt(
            ...this.eye.elements,
            ...this.at.elements,
            ...this.up.elements
        );
    }

    // pitch(angle) {
    //     let direction = new Vector3();
    //     direction.set(this.at);
    //     direction.sub(this.eye);

    //     let right = Vector3.cross(direction, this.up);
    //     right.normalize();

    //     let rotationMatrix = new Matrix4();
    //     rotationMatrix.setRotate(angle, right.elements[0], right.elements[1], right.elements[2]);

    //     let newDir = rotationMatrix.multiplyVector3(direction);

    //     this.at.set(this.eye);
    //     this.at.add(newDir);
    // }
}
