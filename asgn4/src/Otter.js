/*
Name: Alice Xiao-Li
Email: axiaoli@ucsc.edu
Note: Used LLM as a coding assistant
*/
class Otter {
    constructor() {
        this.matrix = new Matrix4();

        // Animation state
        this.torsoAngle = 0;
        this.neckAngle = 0;
        this.headAngle = 0;

        this.tail1Angle = 0;
        this.tail2Angle = 0;

        this.leftForelegTopAngle = 0;
        this.leftForelegMidAngle = 0;
        this.leftForelegBottomAngle = 0;

        this.rightForelegTopAngle = 0;
        this.rightForelegMidAngle = 0;
        this.rightForelegBottomAngle = 0;

        this.leftHindlegTopAngle = 0;
        this.leftHindlegMidAngle = 0;
        this.leftHindlegBottomAngle = 0;

        this.rightHindlegTopAngle = 0;
        this.rightHindlegMidAngle = 0;
        this.rightHindlegBottomAngle = 0;

        // For automatic animation
        this.isAnimating = false;
        this.time = 0;

        // For poke animation
        this.poke = false;
        this.flipStart = 0;
        this.isFlipping = false;
    }

    animate(time) {
        var speed = 3;
        var speed2 = 6;
        var speed3 = 4;

        if (this.poke) {
            this.torsoAngle = (200 * time) % 360;

            this.headAngle = 25 * Math.sin(speed*time + 0.3);

            this.tail1Angle = 10 * Math.sin(speed*time * 2);
            this.tail2Angle = 20 * Math.sin(speed*time * 2 + 0.5);

            this.leftForelegTopAngle = -15 * Math.sin(speed*time * 2)-40;
            this.leftForelegMidAngle = -15 * Math.sin(speed*time * 2 + 0.3)-30;
            this.leftForelegBottomAngle = -15 * Math.sin(speed*time * 2 + 0.6)-40;

            this.rightForelegTopAngle = -15 * Math.sin(speed*time * 2 + Math.PI)-40;
            this.rightForelegMidAngle = -15 * Math.sin(speed*time * 2 + 0.3 + Math.PI)-30;
            this.rightForelegBottomAngle = -15 * Math.sin(speed*time * 2 + 0.6 + Math.PI)-40;

            this.leftHindlegTopAngle = -15 * Math.sin(speed*time * 2 + Math.PI)-40;
            this.leftHindlegMidAngle = -15 * Math.sin(speed*time * 2 + 0.3 + Math.PI)-30;
            this.leftHindlegBottomAngle = -15 * Math.sin(speed*time * 2 + 0.6 + Math.PI)-40;

            this.rightHindlegTopAngle = -15 * Math.sin(speed*time * 2)-40;
            this.rightHindlegMidAngle = -15 * Math.sin(speed*time * 2 + 0.3)-30;
            this.rightHindlegBottomAngle = -15 * Math.sin(speed*time * 2 + 0.6)-40;

        } else if (this.isAnimating) {
            this.torsoAngle = 15 * Math.sin(speed*time);
        
            this.neckAngle = 3 * Math.sin(speed*time);

            this.headAngle = 25 * Math.sin(speed*time + 0.3);

            this.tail1Angle = 30 * Math.sin(speed3*time);
            this.tail2Angle = 30 * Math.sin(speed3*time + 0.3);

            this.leftForelegTopAngle = 25 * Math.sin(speed2*time)+20;
            this.leftForelegMidAngle = 40 * Math.sin(speed2*time + 0.3);
            this.leftForelegBottomAngle = 25 * Math.sin(speed2*time + 0.6)-40;

            this.rightForelegTopAngle = 25 * Math.sin(speed2*time + Math.PI)+20;
            this.rightForelegMidAngle = 40 * Math.sin(speed2*time + Math.PI + 0.3);
            this.rightForelegBottomAngle = 25 * Math.sin(speed2*time + Math.PI + 0.6)-40

            this.leftHindlegTopAngle = 30 * Math.sin(speed3*time + Math.PI)-20;
            this.leftHindlegMidAngle = 25 * Math.sin(speed3*time + Math.PI + 0.3);
            this.leftHindlegBottomAngle = 15 * Math.sin(speed3*time + Math.PI + 0.6)-40;

            this.rightHindlegTopAngle = 30 * Math.sin(speed3*time)-20;
            this.rightHindlegMidAngle = 25 * Math.sin(speed3*time + 0.3);
            this.rightHindlegBottomAngle = 15 * Math.sin(speed3*time + 0.6)-40;

        } else {

            this.torsoAngle = 0;

            this.neckAngle = g_neckAngle;
            this.headAngle = g_headAngle;

            this.tail1Angle = g_tail1Angle;
            this.tail2Angle = g_tail2Angle;

            this.leftForelegTopAngle = g_leg1Angle;
            this.leftForelegMidAngle = g_leg2Angle;
            this.leftForelegBottomAngle = g_leg3Angle;

            this.rightForelegTopAngle = g_leg4Angle;
            this.rightForelegMidAngle = g_leg5Angle;
            this.rightForelegBottomAngle = g_leg6Angle;

            this.leftHindlegTopAngle = g_leg7Angle;
            this.leftHindlegMidAngle = g_leg8Angle;
            this.leftHindlegBottomAngle = g_leg9Angle;

            this.rightHindlegTopAngle = g_leg10Angle;
            this.rightHindlegMidAngle = g_leg11Angle;
            this.rightHindlegBottomAngle = g_leg12Angle;
        }

    }

    render() {
        // Torso
        let torso = new Cube();
        torso.color = [0.302, 0.235, 0.161, 1.0];      // brown
        torso.matrix = new Matrix4(this.matrix);
        torso.matrix.translate(0.0, 0.0, 0.0);
        if (this.isAnimating) {
            torso.matrix.rotate(this.torsoAngle, -1, -1, -1);
        } else if (this.poke) {
            torso.matrix.translate(0.25, 0.1, 0.75);
            torso.matrix.rotate(150, 1, 0, 0);
            torso.matrix.rotate(-this.headAngle, 0, 0, 1);
            torso.matrix.translate(-0.25, -0.1, -0.75);
        }
        let torsoBase = new Matrix4(torso.matrix);
        torso.matrix.scale(0.5, 0.4, 0.95);
        torso.render();
        
        torso.color = [0.529, 0.451, 0.361, 1.0];      // beige
        torso.matrix = new Matrix4(torsoBase);
        torso.matrix.translate(0.0, -0.1, 0.0);
        torso.matrix.scale(0.5, 0.1, 0.95);
        torso.render();

        // Chest
        let chest = new Cube();
        chest.color = [0.302, 0.235, 0.161, 1.0];
        chest.matrix = new Matrix4(torsoBase);
        chest.matrix.translate(-0.05, 0.05, -0.5);
        if (this.isAnimating) {
            chest.matrix.rotate(-this.torsoAngle*0.25, 1, 1, 1);
        } else if (this.poke) {
            chest.matrix.translate(0.0, 0.1, 0.5);
            chest.matrix.rotate(-this.headAngle*0.5, 0, 1, 0);
            chest.matrix.rotate(-40, 1, 0, 0);
            chest.matrix.translate(0.0, -0.1, -0.5);
        }
        let chestBase = new Matrix4(chest.matrix);
        chest.matrix.scale(0.6, 0.4, 0.6);

        chest.render();
        chest.color = [0.529, 0.451, 0.361, 1.0];
        chest.matrix = new Matrix4(chestBase);
        chest.matrix.translate(0.0, -0.2, 0.0);
        chest.matrix.scale(0.6, 0.2, 0.6);
        chest.render();

        // Neck
        let neck = new Cube();
        neck.color = [0.302, 0.235, 0.161, 1.0];
        neck.matrix = new Matrix4(chestBase);
        neck.matrix.translate(0.05, 0.55, -0.25);
        neck.matrix.rotate(60, 1, 0, 0);
        neck.matrix.translate(0.0, -0.05, -0.1);
        if (this.isAnimating) {
            neck.matrix.rotate(this.neckAngle, 0, -1, 0);
        } else if (this.poke) {
            neck.matrix.translate(0.0, 0.0, 0.75);
            neck.matrix.rotate(-80, 1, 0, 0);
            neck.matrix.translate(0.0, 0.0, -0.75);
            neck.matrix.rotate(this.headAngle*0.1, 0, 1, 0);
        } else {
            neck.matrix.translate(-0.05, 0.25, 0.75);
            neck.matrix.rotate(this.neckAngle, 1, 0, 0);
            neck.matrix.translate(0.05, -0.25, -0.75);
        }
        neck.matrix.translate(0.0, 0.05, 0.1);
        let neckBase = new Matrix4(neck.matrix);
        neck.matrix.scale(0.5, 0.3, 0.7);
        neck.render();

        neck.color = [0.529, 0.451, 0.361, 1.0];
        neck.matrix = new Matrix4(neckBase);
        neck.matrix.translate(0.0, -0.1, 0.0);
        neck.matrix.scale(0.5, 0.1, 0.7);
        neck.render();

        // Head
        let head = new Cube();
        head.color = [0.302, 0.235, 0.161, 1.0];
        head.matrix = new Matrix4(neckBase);
        head.matrix.rotate(-60, 1, 0, 0);
        head.matrix.translate(-0.125, -0.4, -0.3);
        if (this.isAnimating) {
            head.matrix.translate(0.4, -1.4, 0.3);
            head.matrix.rotate(this.headAngle, 0, 1, 0);
            head.matrix.translate(-0.4, 1.4, -0.3);
        } else if (this.poke) {
            head.matrix.translate(0.0, 0.5, 0.5);
            head.matrix.rotate(-30, 1, 0, 0);
            head.matrix.translate(0.0, -0.5, -0.5);
            head.matrix.translate(0.4, -1.4, 0.3);
            head.matrix.rotate(this.headAngle, 0, 1, 0.125);
            head.matrix.translate(-0.4, 1.4, -0.3);
        } else {
            head.matrix.translate(0.125, 0.4, 0.6);
            head.matrix.rotate(this.headAngle, 1, 0, 0);
            head.matrix.translate(-0.125, -0.4, -0.6);
        }
        let headBase = new Matrix4(head.matrix);
        head.matrix.scale(0.75, 0.75, 0.7);
        head.render();

        head.color = [0.529, 0.451, 0.361, 1.0];
        head.matrix = new Matrix4(headBase);
        head.matrix.translate(-0.025, -0.0025, -0.025);
        head.matrix.scale(0.8, 0.25, 0.5);
        head.render();
        
        // Snout
        let snout = new Cube();
        snout.color = [0.525, 0.447, 0.361, 1.0];
        snout.matrix = new Matrix4(headBase);
        snout.matrix.translate(0.13, 0.025, -0.15);
        let snoutBase = new Matrix4(snout.matrix);
        snout.matrix.scale(0.5, 0.3, 0.2);
        snout.render();

        // Fish snack for poke animation
        if (this.poke) {
            let fish = new Cone();
            fish.segments = 7;
            fish.color = [0.302, 0.435, 0.661, 1.0];
            fish.matrix = new Matrix4(snoutBase);
            fish.matrix.translate(0.4, 0.0, 0.0);
            fish.matrix.rotate(-90, 0, 0, 1);
            let fishBase = new Matrix4(fish.matrix);
            fish.matrix.scale(0.3, 0.3, 0.1);
            fish.render();

            fish.matrix = new Matrix4(fishBase);
            fish.matrix.translate(0.0, -0.3, 0.0);
            fish.matrix.rotate(180, 1, 0, 0);
            fish.matrix.scale(0.3, 0.3, 0.1);
            fish.render();

            fish.matrix = new Matrix4(fishBase);
            fish.matrix.translate(0.0, -0.4, 0.0);
            fish.matrix.scale(0.3, 0.1, 0.1);
            fish.render();
        }

        // Nose
        let nose = new Cube();
        nose.color = [0.2, 0.2, 0.2, 1.0];
        nose.matrix = new Matrix4(headBase);
        nose.matrix.translate(0.25, 0.225, -0.175);
        nose.matrix.scale(0.25, 0.125, 0.2);
        nose.render();

        // Eyes
        let eye = new Cube();
        eye.color = [0.2, 0.2, 0.2, 1.0];
        eye.matrix = new Matrix4(headBase);
        eye.matrix.translate(0.005, 0.2475, -0.05);
        eye.matrix.scale(0.125, 0.125, 0.125);
        eye.render();

        eye.matrix = new Matrix4(headBase);
        eye.matrix.translate(0.6175, 0.2475, -0.05);
        eye.matrix.scale(0.125, 0.125, 0.125);
        eye.render();

        // Ears
        let ear = new Cube();
        ear.color = [0.302, 0.235, 0.161, 1.0];
        ear.matrix = new Matrix4(headBase);
        ear.matrix.translate(-0.075, 0.4, 0.275);
        let earBase1 = new Matrix4(ear.matrix);
        ear.matrix.scale(0.25, 0.2, 0.15);
        ear.render();

        ear.matrix = new Matrix4(headBase);
        ear.matrix.translate(0.575, 0.4, 0.275);
        let earBase2 = new Matrix4(ear.matrix);
        ear.matrix.scale(0.25, 0.2, 0.15);
        ear.render();

        let earEnd = new Cone();
        earEnd.color = [0.302, 0.235, 0.161, 1.0];
        earEnd.matrix = new Matrix4(earBase1);
        earEnd.matrix.translate(0.05, 0.225, 0.075);
        // earEnd.matrix.rotate(90, 1, 0, 0);
        earEnd.matrix.rotate(135, 0, 1, 0);
        earEnd.matrix.scale(0.15, 0.05, 0.15);
        earEnd.render();

        earEnd.matrix = new Matrix4(earBase2);
        earEnd.matrix.translate(0.2, 0.225, 0.075);
        // earEnd.matrix.rotate(90, 1, 0, 0);
        earEnd.matrix.rotate(135, 0, 1, 0);
        earEnd.matrix.scale(0.15, 0.05, 0.15);
        earEnd.render();

        // Tail
        let tail = new Cube();
        tail.color = [0.302, 0.235, 0.161, 1.0];
        tail.matrix = new Matrix4(torsoBase);
        tail.matrix.translate(0.1, 0.08, 0.8);
        if (this.isAnimating) {
            tail.matrix.rotate(this.tail1Angle, 0.25, 1, 1);
        } else if (this.poke) {
            tail.matrix.rotate(this.tail1Angle, 1, 1, 1);
        } else {
            tail.matrix.rotate(this.tail1Angle, 1, 0, 0);
        }
        tail.matrix.rotate(10, 1, 0, 0);
        let tailBase = new Matrix4(tail.matrix);
        tail.matrix.scale(0.3, 0.3, 0.9);
        tail.render();

        tail.matrix = new Matrix4(tailBase);
        tail.matrix.translate(0.05, 0.05, 0.8);
        if (this.isAnimating) {
            tail.matrix.rotate(this.tail2Angle, -0.5, -0.5, -0.5);
        } else if (this.poke) {
            tail.matrix.rotate(this.tail2Angle, 1, 1, 1);
        } else {
            tail.matrix.rotate(this.tail2Angle, 1, 0, 0);
        }
        tail.matrix.rotate(-5, 1, 0, 0);
        let tailBase2 = new Matrix4(tail.matrix);
        tail.matrix.scale(0.2, 0.2, 0.9);
        tail.render();

        let tailEnd = new Cone();
        tailEnd.color = [0.302, 0.235, 0.161, 1.0];
        tailEnd.matrix = new Matrix4(tailBase2);
        tailEnd.matrix.translate(0.1, 0.1, 0.95);
        tailEnd.matrix.rotate(90, 1, 0, 0);
        tailEnd.matrix.rotate(135, 0, 1, 0);
        tailEnd.matrix.scale(0.25, 0.1, 0.25);
        tailEnd.render();

        // Left Foreleg
        let leftForelegTop = new Cube();
        leftForelegTop.color = [0.302, 0.235, 0.161, 1.0];
        leftForelegTop.matrix = new Matrix4(torsoBase);
        leftForelegTop.matrix.translate(-0.1, -0.25, -0.4);
        leftForelegTop.matrix.translate(0.0, 0.5, 0.1);
        if (this.poke) {
            leftForelegTop.matrix.translate(0.0, -0.2, 0.0);
            leftForelegTop.matrix.rotate(this.leftForelegTopAngle*0.5, 0, 1, 0);
        }
        leftForelegTop.matrix.rotate(this.leftForelegTopAngle, 1, 0, 0);
        leftForelegTop.matrix.translate(0.0, -0.5, -0.1);
        let leftForelegTop1Base = new Matrix4(leftForelegTop.matrix);
        leftForelegTop.matrix.scale(0.3, 0.4, 0.3);
        leftForelegTop.render();

        let leftForelegMid = new Cube();
        leftForelegMid.color = [0.302, 0.235, 0.161, 1.0];
        leftForelegMid.matrix = new Matrix4(leftForelegTop1Base);
        leftForelegMid.matrix.translate(0.025, -0.2, 0.025);
        leftForelegMid.matrix.translate(0.0, 0.2, 0.1);
        leftForelegMid.matrix.rotate(this.leftForelegMidAngle, 1, 0, 0);
        leftForelegMid.matrix.translate(0.0, -0.2, -0.1);
        let leftForelegMid1Base = new Matrix4(leftForelegMid.matrix);
        leftForelegMid.matrix.scale(0.25, 0.3, 0.25);
        leftForelegMid.render();

        let leftForelegBottom = new Cube();
        leftForelegBottom.color = [0.302, 0.235, 0.161, 1.0];
        leftForelegBottom.matrix = new Matrix4(leftForelegMid1Base);
        leftForelegBottom.matrix.translate(-0.025, -0.1, -0.125);
        leftForelegBottom.matrix.translate(0.0, 0.2, 0.2);
        leftForelegBottom.matrix.rotate(this.leftForelegBottomAngle, 1, 0, 0);
        leftForelegBottom.matrix.translate(0.0, -0.2, -0.2);
        leftForelegBottom.matrix.scale(0.3, 0.125, 0.3);
        leftForelegBottom.render();

        // Right Foreleg
        let rightForelegTop = new Cube();
        rightForelegTop.color = [0.302, 0.235, 0.161, 1.0];
        rightForelegTop.matrix = new Matrix4(torsoBase);
        rightForelegTop.matrix.translate(0.3, -0.25, -0.4);
        rightForelegTop.matrix.translate(0.0, 0.5, 0.1);
        if (this.poke) {
            rightForelegTop.matrix.translate(0.0, -0.2, 0.0);
            rightForelegTop.matrix.rotate(this.rightForelegTopAngle*0.5, 0, -1, 0);
        }
        rightForelegTop.matrix.rotate(this.rightForelegTopAngle, 1, 0, 0);
        rightForelegTop.matrix.translate(0.0, -0.5, -0.1);
        let rightForelegTop1Base = new Matrix4(rightForelegTop.matrix);
        rightForelegTop.matrix.scale(0.3, 0.4, 0.3);
        rightForelegTop.render();

        let rightForelegMid = new Cube();
        rightForelegMid.color = [0.302, 0.235, 0.161, 1.0];
        rightForelegMid.matrix = new Matrix4(rightForelegTop1Base);
        rightForelegMid.matrix.translate(0.025, -0.2, 0.025);
        rightForelegMid.matrix.translate(0.0, 0.2, 0.1);
        rightForelegMid.matrix.rotate(this.rightForelegMidAngle, 1, 0, 0);
        rightForelegMid.matrix.translate(0.0, -0.2, -0.1);
        let rightForelegMid1Base = new Matrix4(rightForelegMid.matrix);
        rightForelegMid.matrix.scale(0.25, 0.3, 0.25);
        rightForelegMid.render();

        let rightForelegBottom = new Cube();
        rightForelegBottom.color = [0.302, 0.235, 0.161, 1.0];
        rightForelegBottom.matrix = new Matrix4(rightForelegMid1Base);
        rightForelegBottom.matrix.translate(-0.025, -0.1, -0.125);
        rightForelegBottom.matrix.translate(0.0, 0.2, 0.2);
        rightForelegBottom.matrix.rotate(this.rightForelegBottomAngle, 1, 0, 0);
        rightForelegBottom.matrix.translate(0.0, -0.2, -0.2);
        rightForelegBottom.matrix.scale(0.3, 0.125, 0.3);
        rightForelegBottom.render();

        // Left Hindleg
        let leftHindlegTop = new Cube();
        leftHindlegTop.color = [0.302, 0.235, 0.161, 1.0];
        leftHindlegTop.matrix = new Matrix4(torsoBase);
        leftHindlegTop.matrix.translate(-0.05, -0.25, 0.7);
        leftHindlegTop.matrix.translate(0.0, 0.5, 0.1);
        if (this.poke) {
            leftHindlegTop.matrix.rotate(this.leftHindlegTopAngle*0.5, 0, 1, 0);
        }
        leftHindlegTop.matrix.rotate(this.leftHindlegTopAngle, 1, 0, 0);
        leftHindlegTop.matrix.translate(0.0, -0.5, -0.1);
        let leftHindlegTopBase = new Matrix4(leftHindlegTop.matrix);
        leftHindlegTop.matrix.scale(0.3, 0.45, 0.35);
        leftHindlegTop.render();

        let leftHindlegMid = new Cube();
        leftHindlegMid.color = [0.302, 0.235, 0.161, 1.0];
        leftHindlegMid.matrix = new Matrix4(leftHindlegTopBase);
        leftHindlegMid.matrix.translate(0.025, -0.2, 0.075);
        leftHindlegMid.matrix.translate(0.0, 0.2, 0.1);
        leftHindlegMid.matrix.rotate(this.leftHindlegMidAngle, 1, 0, 0);
        leftHindlegMid.matrix.translate(0.0, -0.2, -0.1);
        let leftHindlegMidBase = new Matrix4(leftHindlegMid.matrix);
        leftHindlegMid.matrix.scale(0.25, 0.3, 0.25);
        leftHindlegMid.render();

        let leftHindlegBottom = new Cube();
        leftHindlegBottom.color = [0.302, 0.235, 0.161, 1.0];
        leftHindlegBottom.matrix = new Matrix4(leftHindlegMidBase);
        leftHindlegBottom.matrix.translate(-0.025, -0.1, -0.125);
        leftHindlegBottom.matrix.translate(0.0, 0.2, 0.2);
        leftHindlegBottom.matrix.rotate(this.leftHindlegBottomAngle, 1, 0, 0);
        leftHindlegBottom.matrix.translate(0.0, -0.2, -0.2);
        leftHindlegBottom.matrix.scale(0.275, 0.125, 0.3);
        leftHindlegBottom.render();

        // Right Hindleg
        let rightHindlegTop = new Cube();
        rightHindlegTop.color = [0.302, 0.235, 0.161, 1.0];
        rightHindlegTop.matrix = new Matrix4(torsoBase);
        rightHindlegTop.matrix.translate(0.25, -0.25, 0.7);
        rightHindlegTop.matrix.translate(0.0, 0.5, 0.1);
        if (this.poke) {
            rightHindlegTop.matrix.rotate(this.rightHindlegTopAngle*0.5, 0, -1, 0);
        }
        rightHindlegTop.matrix.rotate(this.rightHindlegTopAngle, 1, 0, 0);
        rightHindlegTop.matrix.translate(0.0, -0.5, -0.1);
        let rightHindlegTopBase = new Matrix4(rightHindlegTop.matrix);
        rightHindlegTop.matrix.scale(0.3, 0.45, 0.35);
        rightHindlegTop.render();

        let rightHindlegMid = new Cube();
        rightHindlegMid.color = [0.302, 0.235, 0.161, 1.0];
        rightHindlegMid.matrix = new Matrix4(rightHindlegTopBase);
        rightHindlegMid.matrix.translate(0.025, -0.2, 0.075);
        rightHindlegMid.matrix.translate(0.0, 0.2, 0.1);
        rightHindlegMid.matrix.rotate(this.rightHindlegMidAngle, 1, 0, 0);
        rightHindlegMid.matrix.translate(0.0, -0.2, -0.1);
        let rightHindlegMidBase = new Matrix4(rightHindlegMid.matrix);
        rightHindlegMid.matrix.scale(0.25, 0.3, 0.25);
        rightHindlegMid.render();

        let rightHindlegBottom = new Cube();
        rightHindlegBottom.color = [0.302, 0.235, 0.161, 1.0];
        rightHindlegBottom.matrix = new Matrix4(rightHindlegMidBase);
        rightHindlegBottom.matrix.translate(0.0, -0.1, -0.125);
        rightHindlegBottom.matrix.translate(0.0, 0.2, 0.2);
        rightHindlegBottom.matrix.rotate(this.rightHindlegBottomAngle, 1, 0, 0);
        rightHindlegBottom.matrix.translate(0.0, -0.2, -0.2);
        rightHindlegBottom.matrix.scale(0.275, 0.125, 0.3);
        rightHindlegBottom.render();
    }
}